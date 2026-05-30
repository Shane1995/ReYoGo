import { safeStorage } from 'electron';
import type { WebContents } from 'electron';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { createDbClient, schema, type DbClient, type DbHandle } from '@reyogo/db';
import { getTableName } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { CloudSyncEventType, CloudSyncStage, SyncState } from '@shared/types/cloudSync';
import type { CloudSyncEvent } from '@shared/types/cloudSync';
import type { CloudSyncCredentials, SyncStatus } from './types';
import { CLOUD_SYNC_EVENT_CHANNEL } from '@shared/ipc-events';
import { store } from './store';

const STORE_KEY_URL = 'cloudSync.tursoUrl';
const STORE_KEY_TOKEN_ENC = 'cloudSync.authTokenEncrypted';
const STORE_KEY_LAST_SYNCED = 'cloudSync.lastSyncedAt';
const STORE_KEY_SYNC_ERROR = 'cloudSync.syncError';

let _syncStatus: SyncStatus = { state: SyncState.Idle, lastSyncedAt: null, error: null };

function sendEvent(webContents: Pick<WebContents, 'send'>, event: CloudSyncEvent): void {
  webContents.send(CLOUD_SYNC_EVENT_CHANNEL, event);
}

export function hasCloudCredentials(): boolean {
  return !!store.get(STORE_KEY_URL) && !!store.get(STORE_KEY_TOKEN_ENC);
}

export function hasLocalReplica(localDbPath: string): boolean {
  return existsSync(localDbPath);
}

export function getStoredCredentials(): CloudSyncCredentials | null {
  const tursoUrl = store.get(STORE_KEY_URL);
  const encryptedB64 = store.get(STORE_KEY_TOKEN_ENC);
  if (!tursoUrl || !encryptedB64) return null;

  if (!safeStorage.isEncryptionAvailable()) return null;

  const authToken = safeStorage.decryptString(Buffer.from(encryptedB64, 'base64'));
  return { tursoUrl, authToken };
}

export function getTursoUrl(): string | null {
  return store.get(STORE_KEY_URL) ?? null;
}

function persistCredentials(credentials: CloudSyncCredentials): void {
  const encrypted = safeStorage.encryptString(credentials.authToken);
  store.set(STORE_KEY_URL, credentials.tursoUrl);
  store.set(STORE_KEY_TOKEN_ENC, encrypted.toString('base64'));
}

export function clearCredentials(): void {
  store.delete(STORE_KEY_URL);
  store.delete(STORE_KEY_TOKEN_ENC);
  store.delete(STORE_KEY_LAST_SYNCED);
  store.delete(STORE_KEY_SYNC_ERROR);
  _syncStatus = { state: SyncState.Idle, lastSyncedAt: null, error: null };
}

export function getSyncStatus(): SyncStatus {
  return _syncStatus;
}

export function _resetForTest(): void {
  _syncStatus = { state: SyncState.Idle, lastSyncedAt: null, error: null };
}

function updateSyncStatus(partial: Partial<SyncStatus>): void {
  _syncStatus = { ..._syncStatus, ...partial };
}

function getMigrationsFolder(): string {
  return join(__dirname, 'db', 'migrations');
}

export const FK_ORDER_TABLES: SQLiteTable[] = [
  schema.accounts,
  schema.businessGroups,
  schema.entities,
  schema.suppliers,
  schema.inventoryCategories,
  schema.unitsOfMeasure,
  schema.inventoryItems,
  schema.invoices,
  schema.invoiceLineItems,
  schema.stockMovements,
  schema.invoiceAuditLog,
  schema.stockCountSessions,
  schema.stockCountLines,
  schema.costingSnapshots,
];

const BATCH_SIZE = 500;

async function copyTable<T extends SQLiteTable>(
  from: DbClient,
  to: DbClient,
  table: T,
): Promise<number> {
  const rows = await from.select().from(table);
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    // @ts-expect-error TS2769
    await to.insert(table).values(batch).onConflictDoNothing();
  }
  return rows.length;
}

export async function activateCloudSync(
  webContents: Pick<WebContents, 'send'>,
  localDb: DbClient,
  tursoUrl: string,
  authToken: string,
): Promise<void> {
  const remoteHandle: DbHandle = createDbClient(tursoUrl, authToken);
  try {
    sendEvent(webContents, {
      type: CloudSyncEventType.Progress,
      stage: CloudSyncStage.Migrating,
      done: 0,
      total: 1,
    });

    await migrate(remoteHandle.db, { migrationsFolder: getMigrationsFolder() });

    sendEvent(webContents, {
      type: CloudSyncEventType.Progress,
      stage: CloudSyncStage.Migrating,
      done: 1,
      total: 1,
    });

    const totalTables = FK_ORDER_TABLES.length;
    const pushed: Array<{ table: SQLiteTable; localCount: number }> = [];

    sendEvent(webContents, {
      type: CloudSyncEventType.Progress,
      stage: CloudSyncStage.Pushing,
      done: 0,
      total: totalTables,
    });

    for (const table of FK_ORDER_TABLES) {
      pushed.push({ table, localCount: await copyTable(localDb, remoteHandle.db, table) });
      sendEvent(webContents, {
        type: CloudSyncEventType.Progress,
        stage: CloudSyncStage.Pushing,
        done: pushed.length,
        total: totalTables,
      });
    }

    sendEvent(webContents, {
      type: CloudSyncEventType.Progress,
      stage: CloudSyncStage.Verifying,
      done: 0,
      total: totalTables,
    });

    let verifyDone = 0;
    for (const { table, localCount } of pushed) {
      const remoteRows = await remoteHandle.db.select().from(table);

      if (remoteRows.length < localCount) {
        sendEvent(webContents, {
          type: CloudSyncEventType.Error,
          message: `Data loss detected in ${getTableName(table)}: pushed ${localCount} rows but remote only has ${remoteRows.length}`,
          retryable: true,
        });
        return;
      }

      verifyDone++;
      sendEvent(webContents, {
        type: CloudSyncEventType.Progress,
        stage: CloudSyncStage.Verifying,
        done: verifyDone,
        total: totalTables,
      });
    }

    sendEvent(webContents, {
      type: CloudSyncEventType.Progress,
      stage: CloudSyncStage.Activating,
      done: 0,
      total: 1,
    });

    persistCredentials({ tursoUrl, authToken });

    updateSyncStatus({ state: SyncState.Idle, lastSyncedAt: new Date(), error: null });
    store.set(STORE_KEY_LAST_SYNCED, new Date().toISOString());

    sendEvent(webContents, {
      type: CloudSyncEventType.Progress,
      stage: CloudSyncStage.Activating,
      done: 1,
      total: 1,
    });
    sendEvent(webContents, { type: CloudSyncEventType.Success });
  } catch (error) {
    sendEvent(webContents, {
      type: CloudSyncEventType.Error,
      message: error instanceof Error ? error.message : String(error),
      retryable: true,
    });
  } finally {
    remoteHandle.close();
  }
}

export function recordSyncSuccess(): void {
  const now = new Date();
  updateSyncStatus({ state: SyncState.Idle, lastSyncedAt: now, error: null });
  store.set(STORE_KEY_LAST_SYNCED, now.toISOString());
  store.delete(STORE_KEY_SYNC_ERROR);
}

export function recordSyncError(message: string): void {
  store.set(STORE_KEY_SYNC_ERROR, message);
  const lastSyncedAtStr = store.get(STORE_KEY_LAST_SYNCED);
  updateSyncStatus({
    state: SyncState.Error,
    lastSyncedAt: lastSyncedAtStr ? new Date(lastSyncedAtStr) : null,
    error: message,
  });
}

const SYNC_TIMEOUT_MS = 15_000;

export function withSyncTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Sync timed out')), SYNC_TIMEOUT_MS),
    ),
  ]);
}

export function deleteLocalBackup(localDbPath: string): void {
  if (existsSync(localDbPath)) unlinkSync(localDbPath);
}

import { safeStorage } from 'electron';
import type { WebContents } from 'electron';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { createClient } from '@libsql/client';
import { getTableName } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { schema } from '@reyogo/db';
import { CloudSyncEventType, CloudSyncStage, SyncState } from '@shared/types/cloudSync';
import type { CloudSyncEvent } from '@shared/types/cloudSync';
import type { CloudSyncCredentials, SyncStatus } from './types';
import { CLOUD_SYNC_EVENT_CHANNEL } from '@shared/ipc-events';
import { store } from './store';

interface RawDb {
  prepare(sql: string): { all(): Record<string, unknown>[] };
}

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

const SCHEMA_TABLE_MAP = {
  accounts: schema.accounts,
  businessGroups: schema.businessGroups,
  entities: schema.entities,
  suppliers: schema.suppliers,
  inventoryCategories: schema.inventoryCategories,
  unitsOfMeasure: schema.unitsOfMeasure,
  inventoryItems: schema.inventoryItems,
  invoices: schema.invoices,
  invoiceLineItems: schema.invoiceLineItems,
  stockMovements: schema.stockMovements,
  invoiceAuditLog: schema.invoiceAuditLog,
  stockCountSessions: schema.stockCountSessions,
  stockCountLines: schema.stockCountLines,
  costingSnapshots: schema.costingSnapshots,
} satisfies Record<string, SQLiteTable>;

function insertRows(
  db: {
    insert(table: SQLiteTable): {
      values(rows: Record<string, unknown>[]): { onConflictDoNothing(): Promise<unknown> };
    };
  },
  table: SQLiteTable,
  rows: Record<string, unknown>[],
): Promise<unknown> {
  return db.insert(table).values(rows).onConflictDoNothing();
}

export const FK_ORDER_TABLES: Array<keyof typeof SCHEMA_TABLE_MAP> = [
  'accounts',
  'businessGroups',
  'entities',
  'suppliers',
  'inventoryCategories',
  'unitsOfMeasure',
  'inventoryItems',
  'invoices',
  'invoiceLineItems',
  'stockMovements',
  'invoiceAuditLog',
  'stockCountSessions',
  'stockCountLines',
  'costingSnapshots',
] satisfies Array<keyof typeof SCHEMA_TABLE_MAP>;

const BATCH_SIZE = 500;

export async function activateCloudSync(
  webContents: Pick<WebContents, 'send'>,
  _localDbPath: string,
  localDb: RawDb,
  tursoUrl: string,
  authToken: string,
): Promise<void> {
  const remoteClient = createClient({ url: tursoUrl, authToken });
  try {
    sendEvent(webContents, {
      type: CloudSyncEventType.Progress,
      stage: CloudSyncStage.Migrating,
      done: 0,
      total: 1,
    });

    const remoteDb = drizzle(remoteClient, { schema });

    await migrate(remoteDb, { migrationsFolder: getMigrationsFolder() });
    sendEvent(webContents, {
      type: CloudSyncEventType.Progress,
      stage: CloudSyncStage.Migrating,
      done: 1,
      total: 1,
    });

    const totalTables = FK_ORDER_TABLES.length;
    let tablesDone = 0;

    sendEvent(webContents, {
      type: CloudSyncEventType.Progress,
      stage: CloudSyncStage.Pushing,
      done: 0,
      total: totalTables,
    });

    for (const tableName of FK_ORDER_TABLES) {
      const table = SCHEMA_TABLE_MAP[tableName];
      const rows = localDb.prepare(`SELECT * FROM ${getTableName(table)}`).all();

      if (rows.length > 0) {
        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
          const batch = rows.slice(i, i + BATCH_SIZE);
          await insertRows(remoteDb, table, batch);
        }
      }

      tablesDone++;
      sendEvent(webContents, {
        type: CloudSyncEventType.Progress,
        stage: CloudSyncStage.Pushing,
        done: tablesDone,
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
    for (const tableName of FK_ORDER_TABLES) {
      const table = SCHEMA_TABLE_MAP[tableName];
      const localRows = localDb.prepare(`SELECT * FROM ${getTableName(table)}`).all();
      const remoteRows = await remoteDb.select().from(table);

      if (localRows.length !== remoteRows.length) {
        await remoteClient.close();
        sendEvent(webContents, {
          type: CloudSyncEventType.Error,
          message: `Row count mismatch in ${tableName}: local=${localRows.length} remote=${remoteRows.length}`,
          retryable: true,
        });
        return;
      }

      verifyDone++;
      sendEvent(webContents, {
        type: CloudSyncEventType.Progress,
        stage: CloudSyncStage.Verifying,
        done: verifyDone,
        total: FK_ORDER_TABLES.length,
      });
    }

    await remoteClient.close();

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
    await remoteClient.close();
    sendEvent(webContents, {
      type: CloudSyncEventType.Error,
      message: error instanceof Error ? error.message : String(error),
      retryable: true,
    });
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

export function scheduleErrorAfterTimeout(): () => void {
  const timer = setTimeout(() => recordSyncError('Sync timed out'), 300000);
  return () => clearTimeout(timer);
}

export function deleteLocalBackup(localDbPath: string): void {
  if (existsSync(localDbPath)) unlinkSync(localDbPath);
}

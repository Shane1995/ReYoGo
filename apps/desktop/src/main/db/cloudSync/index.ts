import { app, safeStorage, BrowserWindow } from 'electron';
import Store from 'electron-store';
import { existsSync } from 'fs';
import { join } from 'path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { schema } from '@reyogo/db';
import { CloudSyncEventType, CloudSyncStage, SyncState } from '@shared/types/cloudSync';
import type { CloudSyncEvent } from '@shared/types/cloudSync';
import type { CloudSyncCredentials, SyncStatus } from './types';
import { CLOUD_SYNC_EVENT_CHANNEL } from '@shared/ipc-events';

const STORE_KEY_URL = 'cloudSync.tursoUrl';
const STORE_KEY_TOKEN_ENC = 'cloudSync.authTokenEncrypted';
const STORE_KEY_LAST_SYNCED = 'cloudSync.lastSyncedAt';
const STORE_KEY_SYNC_ERROR = 'cloudSync.syncError';

const store = new Store();

let _syncStatus: SyncStatus = { state: SyncState.Idle, lastSyncedAt: null, error: null };
let _syncErrorTimer: ReturnType<typeof setTimeout> | null = null;

function sendEvent(event: CloudSyncEvent): void {
  BrowserWindow.getAllWindows()[0]?.webContents.send(CLOUD_SYNC_EVENT_CHANNEL, event);
}

export function hasCloudCredentials(): boolean {
  return !!store.get(STORE_KEY_URL) && !!store.get(STORE_KEY_TOKEN_ENC);
}

export function hasLocalReplica(): boolean {
  const replicaPath = join(app.getPath('userData'), 'data', 'replica.db');
  return existsSync(replicaPath);
}

export function getStoredCredentials(): CloudSyncCredentials | null {
  const tursoUrl = store.get(STORE_KEY_URL) as string | undefined;
  const encryptedB64 = store.get(STORE_KEY_TOKEN_ENC) as string | undefined;
  if (!tursoUrl || !encryptedB64) return null;

  if (!safeStorage.isEncryptionAvailable()) return null;

  const authToken = safeStorage.decryptString(Buffer.from(encryptedB64, 'base64'));
  return { tursoUrl, authToken };
}

export function getTursoUrl(): string | null {
  return (store.get(STORE_KEY_URL) as string | undefined) ?? null;
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

function updateSyncStatus(partial: Partial<SyncStatus>): void {
  _syncStatus = { ..._syncStatus, ...partial };
}

function getMigrationsFolder(): string {
  return app.isPackaged
    ? join(__dirname, '../db/migrations')
    : require.resolve('@reyogo/db/package.json').replace('package.json', 'migrations');
}

const FK_ORDER_TABLES = [
  'accounts',
  'business_groups',
  'entities',
  'suppliers',
  'inventory_categories',
  'units_of_measure',
  'inventory_items',
  'invoices',
  'invoice_line_items',
  'stock_movements',
  'invoice_audit_log',
  'stock_count_sessions',
  'stock_count_lines',
  'costing_snapshots',
] as const;

const SCHEMA_TABLE_MAP: Record<string, keyof typeof schema> = {
  accounts: 'accounts',
  business_groups: 'businessGroups',
  entities: 'entities',
  suppliers: 'suppliers',
  inventory_categories: 'inventoryCategories',
  units_of_measure: 'unitsOfMeasure',
  inventory_items: 'inventoryItems',
  invoices: 'invoices',
  invoice_line_items: 'invoiceLineItems',
  stock_movements: 'stockMovements',
  invoice_audit_log: 'invoiceAuditLog',
  stock_count_sessions: 'stockCountSessions',
  stock_count_lines: 'stockCountLines',
  costing_snapshots: 'costingSnapshots',
};

const BATCH_SIZE = 500;

export async function activateCloudSync(
  localDbPath: string,
  tursoUrl: string,
  authToken: string,
): Promise<void> {
  sendEvent({
    type: CloudSyncEventType.Progress,
    stage: CloudSyncStage.Migrating,
    done: 0,
    total: 1,
  });

  const remoteClient = createClient({ url: tursoUrl, authToken });
  const remoteDb = drizzle(remoteClient, { schema });

  await migrate(remoteDb, { migrationsFolder: getMigrationsFolder() });
  sendEvent({
    type: CloudSyncEventType.Progress,
    stage: CloudSyncStage.Migrating,
    done: 1,
    total: 1,
  });

  const localClient = createClient({ url: `file:${localDbPath}` });
  const localDb = drizzle(localClient, { schema });

  const totalTables = FK_ORDER_TABLES.length;
  let tablesDone = 0;

  sendEvent({
    type: CloudSyncEventType.Progress,
    stage: CloudSyncStage.Pushing,
    done: 0,
    total: totalTables,
  });

  for (const tableName of FK_ORDER_TABLES) {
    const schemaKey = SCHEMA_TABLE_MAP[tableName] as keyof typeof schema;
    const table = schema[schemaKey];
    const rows = await localDb.select().from(table as never);

    if (rows.length > 0) {
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        await remoteDb
          .insert(table as never)
          .values(batch as never)
          .onConflictDoNothing();
      }
    }

    tablesDone++;
    sendEvent({
      type: CloudSyncEventType.Progress,
      stage: CloudSyncStage.Pushing,
      done: tablesDone,
      total: totalTables,
    });
  }

  sendEvent({
    type: CloudSyncEventType.Progress,
    stage: CloudSyncStage.Verifying,
    done: 0,
    total: totalTables,
  });

  for (const tableName of FK_ORDER_TABLES) {
    const schemaKey = SCHEMA_TABLE_MAP[tableName] as keyof typeof schema;
    const table = schema[schemaKey];
    const [localRows, remoteRows] = await Promise.all([
      localDb.select().from(table as never),
      remoteDb.select().from(table as never),
    ]);

    if (localRows.length !== remoteRows.length) {
      await remoteClient.close();
      await localClient.close();
      sendEvent({
        type: CloudSyncEventType.Error,
        message: `Row count mismatch in ${tableName}: local=${localRows.length} remote=${remoteRows.length}`,
        retryable: true,
      });
      throw new Error(`Row count mismatch in ${tableName}`);
    }
  }

  await localClient.close();
  await remoteClient.close();

  sendEvent({
    type: CloudSyncEventType.Progress,
    stage: CloudSyncStage.Activating,
    done: 0,
    total: 1,
  });

  persistCredentials({ tursoUrl, authToken });

  updateSyncStatus({ state: SyncState.Idle, lastSyncedAt: new Date(), error: null });
  store.set(STORE_KEY_LAST_SYNCED, new Date().toISOString());

  sendEvent({
    type: CloudSyncEventType.Progress,
    stage: CloudSyncStage.Activating,
    done: 1,
    total: 1,
  });
  sendEvent({ type: CloudSyncEventType.Success });
}

export function recordSyncSuccess(): void {
  const now = new Date();
  updateSyncStatus({ state: SyncState.Idle, lastSyncedAt: now, error: null });
  store.set(STORE_KEY_LAST_SYNCED, now.toISOString());
  store.delete(STORE_KEY_SYNC_ERROR);
  if (_syncErrorTimer) {
    clearTimeout(_syncErrorTimer);
    _syncErrorTimer = null;
  }
}

export function recordSyncError(message: string): void {
  store.set(STORE_KEY_SYNC_ERROR, message);
  const lastSyncedAtStr = store.get(STORE_KEY_LAST_SYNCED) as string | undefined;
  updateSyncStatus({
    state: SyncState.Error,
    lastSyncedAt: lastSyncedAtStr ? new Date(lastSyncedAtStr) : null,
    error: message,
  });
}

export function scheduleErrorAfterTimeout(message: string, delayMs = 5 * 60 * 1000): void {
  if (_syncErrorTimer) clearTimeout(_syncErrorTimer);
  _syncErrorTimer = setTimeout(() => recordSyncError(message), delayMs);
}

export function deleteLocalBackup(localDbPath: string): void {
  const { unlinkSync, existsSync: fsExists } = require('fs') as typeof import('fs');
  if (fsExists(localDbPath)) unlinkSync(localDbPath);
}

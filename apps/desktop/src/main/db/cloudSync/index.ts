import { app, safeStorage } from 'electron';
import type { WebContents } from 'electron';
import Store from 'electron-store';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { createClient } from '@libsql/client';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { schema } from '@reyogo/db';
import { CloudSyncEventType, CloudSyncStage, SyncState } from '@shared/types/cloudSync';
import type { CloudSyncEvent } from '@shared/types/cloudSync';
import type { CloudSyncCredentials, SyncStatus } from './types';
import { CLOUD_SYNC_EVENT_CHANNEL } from '@shared/ipc-events';

interface RawDb {
  prepare(sql: string): { all(): Record<string, unknown>[] };
}

const STORE_KEY_URL = 'cloudSync.tursoUrl';
const STORE_KEY_TOKEN_ENC = 'cloudSync.authTokenEncrypted';
const STORE_KEY_LAST_SYNCED = 'cloudSync.lastSyncedAt';
const STORE_KEY_SYNC_ERROR = 'cloudSync.syncError';

type StoreSchema = {
  'cloudSync.tursoUrl': string;
  'cloudSync.authTokenEncrypted': string;
  'cloudSync.lastSyncedAt': string;
  'cloudSync.syncError': string;
};

const store = new Store<StoreSchema>();

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

function updateSyncStatus(partial: Partial<SyncStatus>): void {
  _syncStatus = { ..._syncStatus, ...partial };
}

function getMigrationsFolder(): string {
  return app.isPackaged ? join(__dirname, '../db/migrations') : join(__dirname, '..', 'migrations');
}

const SCHEMA_TABLE_MAP = {
  accounts: schema.accounts,
  business_groups: schema.businessGroups,
  entities: schema.entities,
  suppliers: schema.suppliers,
  inventory_categories: schema.inventoryCategories,
  units_of_measure: schema.unitsOfMeasure,
  inventory_items: schema.inventoryItems,
  invoices: schema.invoices,
  invoice_line_items: schema.invoiceLineItems,
  stock_movements: schema.stockMovements,
  invoice_audit_log: schema.invoiceAuditLog,
  stock_count_sessions: schema.stockCountSessions,
  stock_count_lines: schema.stockCountLines,
  costing_snapshots: schema.costingSnapshots,
} satisfies Record<string, SQLiteTable>;

const TABLE_SQL_NAMES: Record<keyof typeof SCHEMA_TABLE_MAP, string> = {
  accounts: 'accounts',
  business_groups: 'business_groups',
  entities: 'entities',
  suppliers: 'suppliers',
  inventory_categories: 'inventory_categories',
  units_of_measure: 'units_of_measure',
  inventory_items: 'inventory_items',
  invoices: 'invoices',
  invoice_line_items: 'invoice_line_items',
  stock_movements: 'stock_movements',
  invoice_audit_log: 'invoice_audit_log',
  stock_count_sessions: 'stock_count_sessions',
  stock_count_lines: 'stock_count_lines',
  costing_snapshots: 'costing_snapshots',
};

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

const FK_ORDER_TABLES: Array<keyof typeof SCHEMA_TABLE_MAP> = [
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
] satisfies Array<keyof typeof SCHEMA_TABLE_MAP>;

const BATCH_SIZE = 500;

export async function activateCloudSync(
  webContents: Pick<WebContents, 'send'>,
  _localDbPath: string,
  localDb: RawDb,
  tursoUrl: string,
  authToken: string,
): Promise<void> {
  try {
    sendEvent(webContents, {
      type: CloudSyncEventType.Progress,
      stage: CloudSyncStage.Migrating,
      done: 0,
      total: 1,
    });

    const remoteClient = createClient({ url: tursoUrl, authToken });
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
      const sqlName = TABLE_SQL_NAMES[tableName];
      const rows = localDb.prepare(`SELECT * FROM ${sqlName}`).all();

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
      const sqlName = TABLE_SQL_NAMES[tableName];
      const localRows = localDb.prepare(`SELECT * FROM ${sqlName}`).all();
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

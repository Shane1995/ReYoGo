import { app, utilityProcess } from 'electron';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { migrate } from 'drizzle-orm/libsql/migrator';
import {
  createDbClient,
  createReplicaClient,
  createInventoryRepo,
  createSuppliersRepo,
  createStockMovementsRepo,
  createInvoicesRepo,
  createSetupRepo,
  createEntitiesRepo,
  schema,
  type DbClient,
  type DbHandle,
  type ReplicaHandle,
} from '@reyogo/db';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { DB_READY_CHANNEL } from '@shared/ipc-events';
import {
  hasCloudCredentials,
  getStoredCredentials,
  clearCredentials,
  hasEverSynced,
  hasUomRepairRun,
  markUomRepairDone,
  withSyncTimeout,
} from './cloudSync';

const isDev = !app.isPackaged || process.env.NODE_ENV === 'development';
const DB_FILENAME = isDev ? 'app-dev.db' : 'app.db';

type Repos = {
  inventory: ReturnType<typeof createInventoryRepo>;
  suppliers: ReturnType<typeof createSuppliersRepo>;
  stockMovements: ReturnType<typeof createStockMovementsRepo>;
  invoices: ReturnType<typeof createInvoicesRepo>;
  setup: ReturnType<typeof createSetupRepo>;
  entities: ReturnType<typeof createEntitiesRepo>;
};

let _handle: DbHandle | ReplicaHandle | null = null;
let _db: DbClient | null = null;
let _repos: Repos | null = null;
let _initialising = false;
let _reinitialising = false;

function getDataDir(): string {
  const userData = app.getPath('userData');
  const dir = join(userData, 'data');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function getDbPath(): string {
  return join(getDataDir(), DB_FILENAME);
}

export function getLocalDbPath(): string {
  return getDbPath();
}

export function getReplicaPath(): string {
  return join(getDataDir(), 'replica.db');
}

function getMigrationsFolder(): string {
  return join(__dirname, 'db', 'migrations');
}

export function wipeReplicaFiles(replicaPath: string): void {
  for (const p of [
    replicaPath,
    `${replicaPath}-shm`,
    `${replicaPath}-wal`,
    `${replicaPath}-info`,
    `${replicaPath}-client_wal_index`,
  ]) {
    if (existsSync(p)) unlinkSync(p);
  }
}

function buildRepos(db: DbClient): Repos {
  return {
    inventory: createInventoryRepo(db),
    suppliers: createSuppliersRepo(db),
    stockMovements: createStockMovementsRepo(db),
    invoices: createInvoicesRepo(db),
    setup: createSetupRepo(db),
    entities: createEntitiesRepo(db),
  };
}

export function isDbInitialized(): boolean {
  return _repos !== null;
}

export function getRepos(): Repos {
  if (_reinitialising) throw new Error('Database is reinitialising — retry shortly');
  if (!_repos) throw new Error('Database not initialized. Wait for db:ready.');
  return _repos;
}

export function getDb(): DbClient {
  if (!_db) throw new Error('Database not initialized. Wait for db:ready.');
  return _db;
}

export { schema };

export function getDbReadyChannel(): string {
  return DB_READY_CHANNEL;
}

export function isReplicaMode(): boolean {
  return _handle !== null && 'sync' in _handle;
}

type SyncWorkerResult = { success: true } | { success: false; error: string };

export function syncViaUtilityProcess(
  replicaPath: string,
  syncUrl: string,
  authToken: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = utilityProcess.fork(join(__dirname, 'syncWorker', 'index.js'), [], {
      serviceName: 'sync-worker',
    });

    let settled = false;

    const settle = (fn: () => void) => {
      if (!settled) {
        settled = true;
        fn();
      }
    };

    child.postMessage({ replicaPath, syncUrl, authToken });

    child.once('message', (msg: SyncWorkerResult) => {
      settle(() => {
        if (msg.success) {
          resolve();
        } else {
          reject(new Error(msg.error));
        }
      });
    });

    child.once('exit', (code) => {
      if (code !== 0) {
        settle(() => reject(new Error(`Sync worker exited with code ${code}`)));
      }
    });
  });
}

function openReplicaClient(
  replicaPath: string,
  syncUrl: string,
  authToken: string,
): ReturnType<typeof createReplicaClient> {
  try {
    return createReplicaClient(replicaPath, syncUrl, authToken);
  } catch {
    wipeReplicaFiles(replicaPath);
    return createReplicaClient(replicaPath, syncUrl, authToken);
  }
}

async function activateHandle(handle: ReturnType<typeof createReplicaClient>): Promise<void> {
  await migrate(handle.db, { migrationsFolder: getMigrationsFolder() });
  await ensureDefaultAccount(handle.db);
  if (_handle) _handle.close();
  _handle = handle;
  _db = handle.db;
  _repos = buildRepos(handle.db);
}

export async function reinitialiseNoSync(
  replicaPath: string,
  syncUrl: string,
  authToken: string,
): Promise<void> {
  _reinitialising = true;
  let handle: ReturnType<typeof createReplicaClient> | undefined;
  try {
    handle = openReplicaClient(replicaPath, syncUrl, authToken);
    await activateHandle(handle);
  } catch (err) {
    handle?.close();
    throw err;
  } finally {
    _reinitialising = false;
  }
}

const PERMANENT_SYNC_ERROR_MARKERS = ['404', '401', 'auth role not found', 'WriteDelegation'];

function isPermanentSyncError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return PERMANENT_SYNC_ERROR_MARKERS.some((marker) => msg.includes(marker));
}

function isCorruptedReplicaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('database disk image is malformed') ||
    msg.includes('local state is incorrect') ||
    msg.includes('metadata file exists but db file does not')
  );
}

export const ACCOUNT_ID = 'default';

async function ensureDefaultAccount(db: DbClient): Promise<void> {
  const existing = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.id, ACCOUNT_ID))
    .limit(1);

  if (!existing[0]) {
    const ts = new Date();
    await db.insert(schema.accounts).values({
      id: ACCOUNT_ID,
      name: 'Default',
      isCurrent: true,
      createdAt: ts,
      updatedAt: ts,
    });
  }
}

function firstIdOrThrow(rows: { id: string }[], message: string): string {
  const row = rows[0];
  if (!row) throw new Error(message);
  return row.id;
}

export async function resolveCurrentIds(): Promise<{ groupId: string; entityId: string }> {
  const db = getDb();

  const groupRows = await db
    .select({ id: schema.businessGroups.id })
    .from(schema.businessGroups)
    .where(eq(schema.businessGroups.accountId, ACCOUNT_ID))
    .limit(1);

  const groupId = firstIdOrThrow(groupRows, 'No business group found — setup not complete');

  const entityRows = await db
    .select({ id: schema.entities.id })
    .from(schema.entities)
    .where(eq(schema.entities.groupId, groupId))
    .orderBy(schema.entities.createdAt)
    .limit(1);

  const entityId = firstIdOrThrow(entityRows, 'No entity found — setup not complete');

  return { groupId, entityId };
}

export async function repairUomLinks(sourceDb: DbClient, targetDb: DbClient): Promise<void> {
  const sourceItems = await sourceDb
    .select({
      id: schema.inventoryItems.id,
      unitOfMeasureId: schema.inventoryItems.unitOfMeasureId,
    })
    .from(schema.inventoryItems)
    .where(isNotNull(schema.inventoryItems.unitOfMeasureId));

  for (const item of sourceItems) {
    if (!item.unitOfMeasureId) continue;
    await targetDb
      .update(schema.inventoryItems)
      .set({ unitOfMeasureId: item.unitOfMeasureId })
      .where(
        and(eq(schema.inventoryItems.id, item.id), isNull(schema.inventoryItems.unitOfMeasureId)),
      );
  }
}

export async function repairUomLinksIfNeeded(): Promise<void> {
  if (!isReplicaMode()) return;
  if (hasUomRepairRun()) return;

  const localPath = getDbPath();
  if (!existsSync(localPath)) {
    markUomRepairDone();
    return;
  }

  const localHandle = createDbClient(`file:${localPath}`);
  try {
    await repairUomLinks(localHandle.db, getDb());
  } finally {
    localHandle.close();
    markUomRepairDone();
  }
}

export function _setDbStateForTest(
  handle: DbHandle | ReplicaHandle | null,
  db: DbClient | null,
): void {
  _handle = handle;
  _db = db;
}

type ReplicaCredentials = { tursoUrl: string; authToken: string };

async function bootFresh(handle: ReplicaHandle): Promise<void> {
  await withSyncTimeout(handle.sync());
  await activateHandle(handle);
}

async function recoverFromCorruption(
  replicaPath: string,
  credentials: ReplicaCredentials,
): Promise<void> {
  wipeReplicaFiles(replicaPath);
  const handle = openReplicaClient(replicaPath, credentials.tursoUrl, credentials.authToken);
  await bootFresh(handle);
}

function cloudAuthError(): Error {
  const err = new Error('Cloud auth failed — update your auth token in Settings → Cloud Sync.');
  Object.assign(err, { isCloudAuthError: true });
  return err;
}

function cloudConnectionError(): Error {
  return new Error(
    'Could not connect to cloud database. Check your internet connection and relaunch.',
  );
}

async function bootOffline(
  handle: ReplicaHandle,
  replicaPath: string,
  credentials: ReplicaCredentials,
): Promise<void> {
  try {
    await activateHandle(handle);
  } catch (bootErr) {
    if (!isCorruptedReplicaError(bootErr)) throw bootErr;
    handle.close();
    await recoverFromCorruption(replicaPath, credentials);
  }
}

async function recoverFromPermanentSyncError(
  handle: ReplicaHandle,
  replicaPath: string,
): Promise<never> {
  handle.close();
  clearCredentials();
  wipeReplicaFiles(replicaPath);
  throw cloudAuthError();
}

async function recoverFromUnknownBootError(
  handle: ReplicaHandle,
  replicaPath: string,
): Promise<never> {
  handle.close();
  wipeReplicaFiles(replicaPath);
  throw cloudConnectionError();
}

async function bootOnline(
  handle: ReplicaHandle,
  replicaPath: string,
  credentials: ReplicaCredentials,
): Promise<void> {
  try {
    await bootFresh(handle);
  } catch (bootErr) {
    if (isPermanentSyncError(bootErr)) await recoverFromPermanentSyncError(handle, replicaPath);
    if (isCorruptedReplicaError(bootErr)) {
      handle.close();
      await recoverFromCorruption(replicaPath, credentials);
      return;
    }
    await recoverFromUnknownBootError(handle, replicaPath);
  }
}

async function bootWithReplica(credentials: ReplicaCredentials): Promise<void> {
  const replicaPath = getReplicaPath();
  const canBootOffline = existsSync(replicaPath) && hasEverSynced();
  const handle = openReplicaClient(replicaPath, credentials.tursoUrl, credentials.authToken);

  if (canBootOffline) return bootOffline(handle, replicaPath, credentials);
  return bootOnline(handle, replicaPath, credentials);
}

async function bootFromStoredCredentials(): Promise<void> {
  const credentials = hasCloudCredentials() ? getStoredCredentials() : null;
  if (!credentials) throw new Error('No cloud credentials found. Connect to Turso first.');
  await bootWithReplica(credentials);
}

export async function initDatabase(): Promise<void> {
  if (_db !== null || _initialising) return;
  _initialising = true;
  try {
    await bootFromStoredCredentials();
  } finally {
    _initialising = false;
  }
}

export async function reinitialise(
  replicaPath: string,
  syncUrl: string,
  authToken: string,
): Promise<void> {
  _reinitialising = true;
  let handle: ReturnType<typeof createReplicaClient> | undefined;
  try {
    handle = openReplicaClient(replicaPath, syncUrl, authToken);
    await handle.sync();
    await activateHandle(handle);
  } catch (err) {
    handle?.close();
    throw err;
  } finally {
    _reinitialising = false;
  }
}

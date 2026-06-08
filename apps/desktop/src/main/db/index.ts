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

function isPermanentSyncError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('404') ||
    msg.includes('401') ||
    msg.includes('auth role not found') ||
    msg.includes('WriteDelegation')
  );
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

export async function resolveCurrentIds(): Promise<{ groupId: string; entityId: string }> {
  const db = getDb();

  const groupRows = await db
    .select({ id: schema.businessGroups.id })
    .from(schema.businessGroups)
    .where(eq(schema.businessGroups.accountId, ACCOUNT_ID))
    .limit(1);

  const groupId = groupRows[0]?.id;
  if (!groupId) throw new Error('No business group found — setup not complete');

  const entityRows = await db
    .select({ id: schema.entities.id })
    .from(schema.entities)
    .where(eq(schema.entities.groupId, groupId))
    .orderBy(schema.entities.createdAt)
    .limit(1);

  const entityId = entityRows[0]?.id;
  if (!entityId) throw new Error('No entity found — setup not complete');

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

async function bootWithReplica(credentials: {
  tursoUrl: string;
  authToken: string;
}): Promise<void> {
  const replicaPath = getReplicaPath();
  const hadExistingReplica = existsSync(replicaPath);
  const canBootOffline = hadExistingReplica && hasEverSynced();

  const bootFresh = async (h: ReplicaHandle) => {
    await withSyncTimeout(h.sync());
    await activateHandle(h);
  };

  let handle = openReplicaClient(replicaPath, credentials.tursoUrl, credentials.authToken);

  if (canBootOffline) {
    try {
      await activateHandle(handle);
      return;
    } catch (bootErr) {
      if (isCorruptedReplicaError(bootErr)) {
        handle.close();
        wipeReplicaFiles(replicaPath);
        handle = openReplicaClient(replicaPath, credentials.tursoUrl, credentials.authToken);
        await bootFresh(handle);
        return;
      }
      throw bootErr;
    }
  }

  try {
    await bootFresh(handle);
  } catch (bootErr) {
    if (isPermanentSyncError(bootErr)) {
      handle.close();
      clearCredentials();
      wipeReplicaFiles(replicaPath);
      const err = new Error('Cloud auth failed — update your auth token in Settings → Cloud Sync.');
      Object.assign(err, { isCloudAuthError: true });
      throw err;
    } else if (isCorruptedReplicaError(bootErr)) {
      handle.close();
      wipeReplicaFiles(replicaPath);
      handle = openReplicaClient(replicaPath, credentials.tursoUrl, credentials.authToken);
      await bootFresh(handle);
    } else {
      handle.close();
      wipeReplicaFiles(replicaPath);
      throw new Error(
        'Could not connect to cloud database. Check your internet connection and relaunch.',
      );
    }
  }
}

export async function initDatabase(): Promise<void> {
  if (_db !== null || _initialising) return;
  _initialising = true;
  try {
    if (hasCloudCredentials()) {
      const credentials = getStoredCredentials();
      if (credentials) {
        await bootWithReplica(credentials);
        return;
      }
    }
    throw new Error('No cloud credentials found. Connect to Turso first.');
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

import { app } from 'electron';
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
import { eq } from 'drizzle-orm';
import { DB_READY_CHANNEL } from '@shared/ipc-events';
import {
  hasCloudCredentials,
  getStoredCredentials,
  clearCredentials,
  recordSyncError,
  getSyncStatus,
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
  return join(app.getPath('userData'), 'data', 'replica.db');
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

export async function syncNow(): Promise<void> {
  if (_handle && 'sync' in _handle) {
    await (_handle as { sync(): Promise<void> }).sync();
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
  return msg.includes('database disk image is malformed');
}

async function ensureDefaultAccount(db: DbClient): Promise<void> {
  const existing = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.id, 'default'))
    .limit(1);

  if (!existing[0]) {
    const ts = new Date();
    await db
      .insert(schema.accounts)
      .values({ id: 'default', name: 'Default', isCurrent: true, createdAt: ts, updatedAt: ts });
  }
}

export async function initDatabase(): Promise<void> {
  if (_db !== null || _initialising) return;
  _initialising = true;
  try {
    const migrationsFolder = getMigrationsFolder();

    if (hasCloudCredentials()) {
      const credentials = getStoredCredentials();
      if (credentials) {
        const replicaPath = getReplicaPath();
        const hadExistingReplica = existsSync(replicaPath);
        const hasEverSynced = getSyncStatus().lastSyncedAt !== null;
        const canBootOffline = hadExistingReplica && hasEverSynced;
        let handle: ReplicaHandle;
        try {
          handle = createReplicaClient(replicaPath, credentials.tursoUrl, credentials.authToken);
        } catch {
          wipeReplicaFiles(replicaPath);
          handle = createReplicaClient(replicaPath, credentials.tursoUrl, credentials.authToken);
        }

        const boot = async (h: typeof handle) => {
          await withSyncTimeout(h.sync());
          await migrate(h.db, { migrationsFolder });
          await ensureDefaultAccount(h.db);
          _handle = h;
          _db = h.db;
          _repos = buildRepos(h.db);
        };

        try {
          await boot(handle);
        } catch (bootErr) {
          if (isPermanentSyncError(bootErr)) {
            handle.close();
            clearCredentials();
            wipeReplicaFiles(replicaPath);
            throw new Error(
              'Cloud database no longer accessible. Reconnect your account in Settings.',
            );
          }
          if (isCorruptedReplicaError(bootErr)) {
            handle.close();
            wipeReplicaFiles(replicaPath);
            handle = createReplicaClient(replicaPath, credentials.tursoUrl, credentials.authToken);
            await boot(handle);
          } else if (!canBootOffline) {
            handle.close();
            wipeReplicaFiles(replicaPath);
            throw new Error(
              'Could not connect to cloud database. Check your internet connection and relaunch.',
            );
          } else {
            recordSyncError(bootErr instanceof Error ? bootErr.message : String(bootErr));
            await migrate(handle.db, { migrationsFolder });
            await ensureDefaultAccount(handle.db);
            _handle = handle;
            _db = handle.db;
            _repos = buildRepos(handle.db);
          }
        }

        return;
      }
    }

    const dbPath = getDbPath();
    const handle = createDbClient(`file:${dbPath}`);
    _handle = handle;
    _db = handle.db;
    await migrate(handle.db, { migrationsFolder });
    await ensureDefaultAccount(handle.db);
    _repos = buildRepos(handle.db);
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
  try {
    let handle;
    try {
      handle = createReplicaClient(replicaPath, syncUrl, authToken);
    } catch {
      wipeReplicaFiles(replicaPath);
      handle = createReplicaClient(replicaPath, syncUrl, authToken);
    }
    await handle.sync();
    if (_handle) _handle.close();
    _handle = handle;
    _db = handle.db;
    _repos = buildRepos(handle.db);
  } finally {
    _reinitialising = false;
  }
}

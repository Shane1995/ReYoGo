import { app } from 'electron';
import { existsSync, mkdirSync } from 'fs';
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
import { hasCloudCredentials, getStoredCredentials } from './cloudSync';

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
        const handle = createReplicaClient(
          replicaPath,
          credentials.tursoUrl,
          credentials.authToken,
        );
        _handle = handle;
        _db = handle.db;
        await handle.sync();
        await migrate(handle.db, { migrationsFolder });
        await ensureDefaultAccount(handle.db);
        _repos = buildRepos(handle.db);
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
    if (_handle) _handle.close();
    const handle = createReplicaClient(replicaPath, syncUrl, authToken);
    await handle.sync();
    await migrate(handle.db, { migrationsFolder: getMigrationsFolder() });
    _handle = handle;
    _db = handle.db;
    _repos = buildRepos(handle.db);
  } finally {
    _reinitialising = false;
  }
}

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

let _db: DbClient | null = null;
let _repos: Repos | null = null;
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
  return app.isPackaged ? join(__dirname, 'db', 'migrations') : join(__dirname, 'migrations');
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
  const migrationsFolder = getMigrationsFolder();

  if (hasCloudCredentials()) {
    const credentials = getStoredCredentials();
    if (credentials) {
      const replicaPath = getReplicaPath();
      const { db, sync } = createReplicaClient(
        replicaPath,
        credentials.tursoUrl,
        credentials.authToken,
      );
      _db = db;
      await sync();
      await migrate(db, { migrationsFolder });
      await ensureDefaultAccount(db);
      _repos = buildRepos(db);
      return;
    }
  }

  const dbPath = getDbPath();
  const db = createDbClient(`file:${dbPath}`);
  _db = db;
  await migrate(db, { migrationsFolder });
  await ensureDefaultAccount(db);
  _repos = buildRepos(db);
}

export async function reinitialise(
  replicaPath: string,
  syncUrl: string,
  authToken: string,
): Promise<void> {
  _reinitialising = true;
  try {
    const { db, sync } = createReplicaClient(replicaPath, syncUrl, authToken);
    await sync();
    await migrate(db, { migrationsFolder: getMigrationsFolder() });
    _db = db;
    _repos = buildRepos(db);
  } finally {
    _reinitialising = false;
  }
}

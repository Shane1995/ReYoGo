import { app } from 'electron';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { migrate } from 'drizzle-orm/libsql/migrator';
import {
  createDbClient,
  createInventoryRepo,
  createSuppliersRepo,
  createStockMovementsRepo,
  createInvoicesRepo,
  createSetupRepo,
  schema,
  type DbClient,
} from '@reyogo/db';
import { eq } from 'drizzle-orm';
import { DB_READY_CHANNEL } from '@shared/ipc-events';

const isDev = !app.isPackaged || process.env.NODE_ENV === 'development';
const DB_FILENAME = isDev ? 'app-dev.db' : 'app.db';

type Repos = {
  inventory: ReturnType<typeof createInventoryRepo>;
  suppliers: ReturnType<typeof createSuppliersRepo>;
  stockMovements: ReturnType<typeof createStockMovementsRepo>;
  invoices: ReturnType<typeof createInvoicesRepo>;
  setup: ReturnType<typeof createSetupRepo>;
};

let _db: DbClient | null = null;
let _repos: Repos | null = null;

function getDbPath(): string {
  const userData = app.getPath('userData');
  const dbDir = join(userData, 'data');
  if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });
  return join(dbDir, DB_FILENAME);
}

export function getRepos(): Repos {
  if (!_repos) throw new Error('Database not initialized. Wait for db:ready.');
  return _repos;
}

/** @deprecated Use getRepos() instead — will be removed in Task 11. */
export function getDb(): DbClient {
  if (!_db) throw new Error('Database not initialized. Wait for db:ready.');
  return _db;
}

export { schema };

export function getDbReadyChannel(): string {
  return DB_READY_CHANNEL;
}

export async function initDatabase(): Promise<void> {
  const dbPath = getDbPath();
  const db: DbClient = createDbClient(`file:${dbPath}`);
  _db = db;

  const migrationsFolder = app.isPackaged
    ? join(__dirname, 'db', 'migrations')
    : require.resolve('@reyogo/db/package.json').replace('package.json', 'migrations');

  await migrate(db, { migrationsFolder });

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

  _repos = {
    inventory: createInventoryRepo(db),
    suppliers: createSuppliersRepo(db),
    stockMovements: createStockMovementsRepo(db),
    invoices: createInvoicesRepo(db),
    setup: createSetupRepo(db),
  };
}

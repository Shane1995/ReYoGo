import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { app } from 'electron';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { DB_READY_CHANNEL } from '../../shared/ipc-events';
import * as schema from './drizzle/schema';


const isDev = !app.isPackaged || process.env.NODE_ENV === 'development';
const DB_FILENAME = isDev ? 'app-dev.db' : 'app.db';

let sqlite: Database.Database | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function getDbPath(): string {
  const userData = app.getPath('userData');
  const dbDir = join(userData, 'data');
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }
  return join(dbDir, DB_FILENAME);
}

export function getDb(): ReturnType<typeof drizzle> {
  if (!_db) {
    throw new Error('Database not initialized. Wait for db:ready.');
  }
  return _db;
}

export function getDbReadyChannel(): string {
  return DB_READY_CHANNEL;
}

export { schema };

export async function initDatabase(): Promise<void> {
  const dbPath = getDbPath();
  sqlite = new Database(dbPath);
  _db = drizzle(sqlite, { schema });

  const migrationsFolder =
    app.isPackaged && __dirname.includes('app.asar')
      ? join(__dirname.replace('app.asar', 'app.asar.unpacked'), 'migrations')
      : join(__dirname, 'migrations');
  await migrate(_db, { migrationsFolder });

}

import { migrate } from 'drizzle-orm/libsql/migrator';
import { join } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { createDbClient, type DbClient } from '../client';
import * as schema from '../schema';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export async function createTestDb(): Promise<DbClient> {
  // Use a temp file instead of :memory: — the libsql transaction() method sets #db=null
  // so subsequent queries after a transaction would get a blank new :memory: connection.
  const tmpPath = join(
    tmpdir(),
    `reyogo-test-${Date.now()}-${Math.random().toString(36).slice(2)}.db`,
  );
  const db = createDbClient(`file:${tmpPath}`);
  await migrate(db, {
    migrationsFolder: join(__dirname, '../../migrations'),
  });
  await db.insert(schema.accounts).values({
    id: 'default',
    name: 'Default',
    isCurrent: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return db;
}

export type { DbClient } from '../client';

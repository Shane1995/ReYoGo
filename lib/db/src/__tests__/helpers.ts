import { migrate } from 'drizzle-orm/libsql/migrator';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { createDbClient, type DbClient } from '../client';
import * as schema from '../schema';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export async function createTestDb(): Promise<DbClient> {
  const db = createDbClient(':memory:');
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

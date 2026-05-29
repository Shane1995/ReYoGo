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
  const now = new Date();
  await db
    .insert(schema.accounts)
    .values({
      id: 'default',
      name: 'Default',
      isCurrent: true,
      setupComplete: false,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing();
  await db
    .insert(schema.businessGroups)
    .values({
      id: 'default-group',
      accountId: 'default',
      name: 'Test Group',
      createdAt: now,
    })
    .onConflictDoNothing();
  await db
    .insert(schema.entities)
    .values({
      id: 'default',
      groupId: 'default-group',
      name: 'Test Entity',
      defaultVatRate: 15,
      defaultVatMode: 'exclusive',
      createdAt: now,
    })
    .onConflictDoNothing();
  return db;
}

export type { DbClient } from '../client';

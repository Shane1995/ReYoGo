import { migrate } from 'drizzle-orm/libsql/migrator';
import { join } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { VatMode } from '@reyogo/types';
import { createDbClient, type DbClient } from '../client';
import * as schema from '../schema';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export async function createTestDb(): Promise<DbClient> {
  const tmpPath = join(
    tmpdir(),
    `reyogo-test-${Date.now()}-${Math.random().toString(36).slice(2)}.db`,
  );
  const { db } = createDbClient(`file:${tmpPath}`);
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
    .onConflictDoUpdate({ target: schema.businessGroups.id, set: { name: 'Test Group' } });
  await db
    .insert(schema.entities)
    .values({
      id: 'default',
      groupId: 'default-group',
      name: 'Test Entity',
      defaultVatRate: 15,
      defaultVatMode: VatMode.Exclusive,
      createdAt: now,
    })
    .onConflictDoUpdate({ target: schema.entities.id, set: { name: 'Test Entity' } });
  return db;
}

export type { DbClient } from '../client';

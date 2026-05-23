// @vitest-environment node
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as schema from '../../db/drizzle/schema';

export type TestDb = ReturnType<typeof drizzle<typeof schema>>;

export function createTestDb(): TestDb {
  const sqlite = new Database(':memory:');
  const sql = readFileSync(
    join(__dirname, '../../db/migrations/0000_abnormal_tana_nile.sql'),
    'utf-8',
  );
  for (const stmt of sql.split('--> statement-breakpoint')) {
    const s = stmt.trim();
    if (s) sqlite.exec(s);
  }
  const db = drizzle(sqlite, { schema });
  // All tenant tables FK to accounts(id) — seed the default account
  db.insert(schema.accounts)
    .values({
      id: 'default',
      name: 'Default',
      isCurrent: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .run();
  return db;
}

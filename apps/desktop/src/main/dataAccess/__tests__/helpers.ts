// @vitest-environment node
import initSqlJs from 'sql.js';
import { drizzle } from 'drizzle-orm/sql-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as schema from '../../db/drizzle/schema';

export type TestDb = ReturnType<typeof drizzle<typeof schema>>;

export async function createTestDb(): Promise<TestDb> {
  const SQL = await initSqlJs();
  const sqlite = new SQL.Database();

  const migrationSql = readFileSync(
    join(__dirname, '../../db/migrations/0000_abnormal_tana_nile.sql'),
    'utf-8',
  );
  for (const stmt of migrationSql.split('--> statement-breakpoint')) {
    const s = stmt.trim();
    if (s) sqlite.run(s);
  }

  const db = drizzle(sqlite, { schema });
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

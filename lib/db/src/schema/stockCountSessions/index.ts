import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { StocktakeSessionStatus } from '@reyogo/types';
import { accounts } from '../accounts';

export const stockCountSessions = sqliteTable('stock_count_sessions', {
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  label: text('label'),
  status: text('status').$type<StocktakeSessionStatus>().notNull().default('open'),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
export type StockCountSessionRow = typeof stockCountSessions.$inferSelect;
export type NewStockCountSessionRow = typeof stockCountSessions.$inferInsert;

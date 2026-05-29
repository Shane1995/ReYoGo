import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { accounts } from '../accounts';

export const businessGroups = sqliteTable('business_groups', {
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
export type BusinessGroupRow = typeof businessGroups.$inferSelect;
export type NewBusinessGroupRow = typeof businessGroups.$inferInsert;

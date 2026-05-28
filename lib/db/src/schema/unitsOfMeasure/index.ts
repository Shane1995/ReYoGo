import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { accounts } from '../accounts';

export const unitsOfMeasure = sqliteTable('units_of_measure', {
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
export type UnitOfMeasureRow = typeof unitsOfMeasure.$inferSelect;
export type NewUnitOfMeasureRow = typeof unitsOfMeasure.$inferInsert;

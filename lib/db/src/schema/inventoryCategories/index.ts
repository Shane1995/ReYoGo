import { check, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import type { InventoryType } from '@reyogo/types';
import { accounts } from '../accounts';

export const inventoryCategories = sqliteTable(
  'inventory_categories',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: text('type').notNull().$type<InventoryType>(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (t) => ({
    typeCheck: check(
      'inventory_categories_type_check',
      sql`${t.type} IN ('food', 'beverage', 'non-food')`,
    ),
  }),
);
export type InventoryCategoryRow = typeof inventoryCategories.$inferSelect;
export type NewInventoryCategoryRow = typeof inventoryCategories.$inferInsert;

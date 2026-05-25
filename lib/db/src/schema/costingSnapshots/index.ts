import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { accounts } from '../accounts';
import { inventoryItems } from '../inventoryItems';

export const costingSnapshots = sqliteTable('costing_snapshots', {
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  inventoryItemId: text('inventory_item_id')
    .notNull()
    .references(() => inventoryItems.id, { onDelete: 'restrict' }),
  snapshotDate: integer('snapshot_date', { mode: 'timestamp' }).notNull(),
  weightedAvgCost: real('weighted_avg_cost'),
  stockQty: real('stock_qty'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
export type CostingSnapshotRow = typeof costingSnapshots.$inferSelect;
export type NewCostingSnapshotRow = typeof costingSnapshots.$inferInsert;

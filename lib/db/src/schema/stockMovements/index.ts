import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { MovementType, ReferenceType } from '@reyogo/types';
import { accounts } from '../accounts';
import { inventoryItems } from '../inventoryItems';

export const stockMovements = sqliteTable(
  'stock_movements',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    inventoryItemId: text('inventory_item_id')
      .notNull()
      .references(() => inventoryItems.id, { onDelete: 'restrict' }),
    movementType: text('movement_type').$type<MovementType>().notNull(),
    qty: real('qty').notNull(),
    unitCostAtTime: real('unit_cost_at_time'),
    totalCost: real('total_cost'),
    weightedAvgCostAfter: real('weighted_avg_cost_after'),
    stockQtyAfter: real('stock_qty_after').notNull(),
    referenceType: text('reference_type').$type<ReferenceType>(),
    referenceId: text('reference_id'),
    notes: text('notes'),
    occurredAt: integer('occurred_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (t) => ({
    stockMovementsByItemTime: index('stock_movements_item_time_idx').on(
      t.inventoryItemId,
      t.occurredAt,
    ),
    stockMovementsByRef: index('stock_movements_ref_idx').on(t.referenceType, t.referenceId),
  }),
);
export type StockMovementRow = typeof stockMovements.$inferSelect;
export type NewStockMovementRow = typeof stockMovements.$inferInsert;

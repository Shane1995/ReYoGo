import { index, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { stockCountSessions } from '../stockCountSessions';
import { inventoryItems } from '../inventoryItems';

export const stockCountLines = sqliteTable(
  'stock_count_lines',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => stockCountSessions.id, { onDelete: 'cascade' }),
    inventoryItemId: text('inventory_item_id')
      .notNull()
      .references(() => inventoryItems.id, { onDelete: 'restrict' }),
    countedQty: real('counted_qty').notNull(),
    notes: text('notes'),
  },
  (t) => ({
    linesBySession: index('stock_count_lines_session_idx').on(t.sessionId),
  }),
);
export type StockCountLineRow = typeof stockCountLines.$inferSelect;
export type NewStockCountLineRow = typeof stockCountLines.$inferInsert;

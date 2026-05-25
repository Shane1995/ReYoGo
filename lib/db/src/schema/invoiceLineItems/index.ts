import { index, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { invoices } from '../invoices';
import { inventoryItems } from '../inventoryItems';

export const invoiceLineItems = sqliteTable(
  'invoice_line_items',
  {
    id: text('id').primaryKey(),
    invoiceId: text('invoice_id')
      .notNull()
      .references(() => invoices.id, { onDelete: 'cascade' }),
    inventoryItemId: text('inventory_item_id')
      .notNull()
      .references(() => inventoryItems.id, { onDelete: 'restrict' }),
    qty: real('qty').notNull(),
    unitCost: real('unit_cost').notNull().default(0),
    totalCost: real('total_cost').notNull().default(0),
  },
  (t) => ({
    invoiceLinesByInvoice: index('invoice_lines_invoice_idx').on(t.invoiceId),
  }),
);
export type InvoiceLineItemRow = typeof invoiceLineItems.$inferSelect;
export type NewInvoiceLineItemRow = typeof invoiceLineItems.$inferInsert;

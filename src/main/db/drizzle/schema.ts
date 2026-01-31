import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Accounts table. Use integer timestamps (Unix ms) for SQLite; Drizzle maps them to Date in JS.
 */
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  isCurrent: integer('is_current', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

/**
 * Inventory categories (e.g. Pantry, Dairy under Foods). type is one of: food, drink, non-perishable.
 */
export const inventoryCategories = sqliteTable('inventory_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

/**
 * Inventory items belong to a category (FK cascade delete). unit_of_measure optional; type derived from category when reading.
 */
export const inventoryItems = sqliteTable('inventory_items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  categoryId: text('category_id')
    .notNull()
    .references(() => inventoryCategories.id, { onDelete: 'cascade' }),
  unitOfMeasure: text('unit_of_measure'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export type InventoryCategoryRow = typeof inventoryCategories.$inferSelect;
export type NewInventoryCategoryRow = typeof inventoryCategories.$inferInsert;
export type InventoryItemRow = typeof inventoryItems.$inferSelect;
export type NewInventoryItemRow = typeof inventoryItems.$inferInsert;

/**
 * Captured invoices (goods received receipts). One header per submission; lines in captured_invoice_lines.
 * created_at is immutable for history/audit.
 */
export const capturedInvoices = sqliteTable('captured_invoices', {
  id: text('id').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type CapturedInvoiceRow = typeof capturedInvoices.$inferSelect;
export type NewCapturedInvoiceRow = typeof capturedInvoices.$inferInsert;

/**
 * Line items on a captured invoice. FK to inventory_items; item_name_snapshot preserves display name
 * at capture time for history even if item is later deleted. All monetary values stored as entered.
 */
export const capturedInvoiceLines = sqliteTable('captured_invoice_lines', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id')
    .notNull()
    .references(() => capturedInvoices.id, { onDelete: 'cascade' }),
  itemId: text('item_id').notNull()
    .references(() => inventoryItems.id, { onDelete: 'restrict' }),
  itemNameSnapshot: text('item_name_snapshot').notNull(),
  unitOfMeasure: text('unit_of_measure'),
  quantity: real('quantity').notNull(),
  vatMode: text('vat_mode').notNull(), // 'inclusive' | 'exclusive' | 'non-taxable'
  vatRate: real('vat_rate').notNull(),
  totalVatExclude: real('total_vat_exclude').notNull(),
});

export type CapturedInvoiceLineRow = typeof capturedInvoiceLines.$inferSelect;
export type NewCapturedInvoiceLineRow = typeof capturedInvoiceLines.$inferInsert;

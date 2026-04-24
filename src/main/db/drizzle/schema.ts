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
  weightedAvgCost: real('weighted_avg_cost'),
  totalStock: real('total_stock'),
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
  invoiceNumber: text('invoice_number'),
  invoiceDate: integer('invoice_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
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

/**
 * Audit log for invoice edits. Each row is a snapshot (JSON) of the invoice+lines
 * taken immediately before the edit was applied.
 */
export const invoiceAuditLog = sqliteTable('invoice_audit_log', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id')
    .notNull()
    .references(() => capturedInvoices.id, { onDelete: 'cascade' }),
  editedAt: integer('edited_at', { mode: 'timestamp' }).notNull(),
  note: text('note'),
  snapshot: text('snapshot').notNull(), // JSON: ICapturedInvoiceWithLines
});

export type InvoiceAuditLogRow = typeof invoiceAuditLog.$inferSelect;
export type NewInvoiceAuditLogRow = typeof invoiceAuditLog.$inferInsert;

/**
 * Units of measure configurable by the user (e.g. litres, kgs, unit, pieces).
 */
export const unitsOfMeasure = sqliteTable('units_of_measure', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type UnitOfMeasureRow = typeof unitsOfMeasure.$inferSelect;
export type NewUnitOfMeasureRow = typeof unitsOfMeasure.$inferInsert;

/**
 * Key-value store for application configuration (e.g. setup_complete flag).
 */
export const appConfig = sqliteTable('app_config', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export type AppConfigRow = typeof appConfig.$inferSelect;

export const stockMovements = sqliteTable('stock_movements', {
  id: text('id').primaryKey(),
  itemId: text('item_id').notNull().references(() => inventoryItems.id, { onDelete: 'restrict' }),
  itemNameSnapshot: text('item_name_snapshot').notNull(),
  type: text('type').notNull(),
  quantity: real('quantity').notNull(),
  source: text('source').notNull(),
  referenceId: text('reference_id'),
  costAtTime: real('cost_at_time'),
  cogsAmount: real('cogs_amount'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type StockMovementRow = typeof stockMovements.$inferSelect;
export type NewStockMovementRow = typeof stockMovements.$inferInsert;

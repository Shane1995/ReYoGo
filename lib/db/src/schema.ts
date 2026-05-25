import { check, index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import type { MovementType, ReferenceType, StocktakeSessionStatus } from '@reyogo/types';

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  isCurrent: integer('is_current', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

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

export const inventoryCategories = sqliteTable(
  'inventory_categories',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: text('type').notNull(),
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

export const inventoryItems = sqliteTable('inventory_items', {
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  categoryId: text('category_id')
    .notNull()
    .references(() => inventoryCategories.id, { onDelete: 'cascade' }),
  unitOfMeasureId: text('unit_of_measure_id').references(() => unitsOfMeasure.id, {
    onDelete: 'set null',
  }),
  sku: text('sku'),
  reorderPoint: real('reorder_point'),
  reorderQty: real('reorder_qty'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
export type InventoryItemRow = typeof inventoryItems.$inferSelect;
export type NewInventoryItemRow = typeof inventoryItems.$inferInsert;

export const suppliers = sqliteTable('suppliers', {
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  contactName: text('contact_name'),
  phone: text('phone'),
  email: text('email'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
export type SupplierRow = typeof suppliers.$inferSelect;
export type NewSupplierRow = typeof suppliers.$inferInsert;

export const invoices = sqliteTable(
  'invoices',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    supplierId: text('supplier_id').references(() => suppliers.id, { onDelete: 'set null' }),
    invoiceNumber: text('invoice_number'),
    invoiceDate: integer('invoice_date', { mode: 'timestamp' }),
    status: text('status').notNull().default('DRAFT'),
    totalExclTax: real('total_excl_tax').notNull().default(0),
    taxAmount: real('tax_amount').notNull().default(0),
    totalInclTax: real('total_incl_tax').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
  },
  (t) => ({
    invoicesBySupplier: index('invoices_supplier_idx').on(t.supplierId),
    statusCheck: check('invoices_status_check', sql`${t.status} IN ('DRAFT', 'POSTED')`),
  }),
);
export type InvoiceRow = typeof invoices.$inferSelect;
export type NewInvoiceRow = typeof invoices.$inferInsert;

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

export const invoiceAuditLog = sqliteTable('invoice_audit_log', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id')
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  editedAt: integer('edited_at', { mode: 'timestamp' }).notNull(),
  note: text('note'),
  snapshot: text('snapshot').notNull(),
});
export type InvoiceAuditLogRow = typeof invoiceAuditLog.$inferSelect;
export type NewInvoiceAuditLogRow = typeof invoiceAuditLog.$inferInsert;

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

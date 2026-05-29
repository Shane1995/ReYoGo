import { check, index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { accounts } from '../accounts';
import { entities } from '../entities';
import { suppliers } from '../suppliers';

export const invoices = sqliteTable(
  'invoices',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    entityId: text('entity_id')
      .notNull()
      .references(() => entities.id, { onDelete: 'restrict' }),
    supplierId: text('supplier_id').references(() => suppliers.id, { onDelete: 'set null' }),
    invoiceNumber: text('invoice_number'),
    invoiceDate: integer('invoice_date', { mode: 'timestamp' }),
    status: text('status').notNull().default('DRAFT'),
    vatMode: text('vat_mode').notNull().default('exclusive'),
    vatRate: real('vat_rate').notNull().default(15),
    totalExclTax: real('total_excl_tax').notNull().default(0),
    taxAmount: real('tax_amount').notNull().default(0),
    totalInclTax: real('total_incl_tax').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
  },
  (t) => ({
    invoicesBySupplier: index('invoices_supplier_idx').on(t.supplierId),
    invoicesByEntity: index('invoices_entity_idx').on(t.entityId),
    statusCheck: check('invoices_status_check', sql`${t.status} IN ('DRAFT', 'POSTED')`),
  }),
);
export type InvoiceRow = typeof invoices.$inferSelect;
export type NewInvoiceRow = typeof invoices.$inferInsert;

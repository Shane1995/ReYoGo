import {
  check,
  foreignKey,
  index,
  integer,
  real,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';
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
    sourceInvoiceId: text('source_invoice_id'),
    invoiceNumber: text('invoice_number').notNull(),
    invoiceDate: integer('invoice_date', { mode: 'timestamp' }),
    status: text('status')
      .notNull()
      .default('DRAFT')
      .$type<import('@reyogo/types').InvoiceStatus>(),
    vatMode: text('vat_mode')
      .notNull()
      .default('exclusive')
      .$type<import('@reyogo/types').VatMode>(),
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
    sourceInvoiceIdx: index('invoices_source_invoice_idx').on(t.sourceInvoiceId),
    sourceInvoiceFk: foreignKey({
      columns: [t.sourceInvoiceId],
      foreignColumns: [t.id],
      name: 'invoices_source_invoice_fk',
    }).onDelete('restrict'),
    statusCheck: check(
      'invoices_status_check',
      sql`${t.status} IN ('DRAFT', 'POSTED', 'CREDIT_NOTE')`,
    ),
  }),
);
export type InvoiceRow = typeof invoices.$inferSelect;
export type NewInvoiceRow = typeof invoices.$inferInsert;

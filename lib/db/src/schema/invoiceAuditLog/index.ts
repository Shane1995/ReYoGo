import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { invoices } from '../invoices';

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

import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { entities } from '../entities';

export const suppliers = sqliteTable(
  'suppliers',
  {
    id: text('id').primaryKey(),
    entityId: text('entity_id')
      .notNull()
      .references(() => entities.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    contactName: text('contact_name'),
    phone: text('phone'),
    email: text('email'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (t) => ({
    nameEntityUnique: uniqueIndex('suppliers_name_entity_idx').on(t.entityId, t.name),
  }),
);
export type SupplierRow = typeof suppliers.$inferSelect;
export type NewSupplierRow = typeof suppliers.$inferInsert;

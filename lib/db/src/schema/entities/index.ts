import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { VatMode } from '@reyogo/types';
import { businessGroups } from '../businessGroups';

export const entities = sqliteTable('entities', {
  id: text('id').primaryKey(),
  groupId: text('group_id')
    .notNull()
    .references(() => businessGroups.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  defaultVatRate: integer('default_vat_rate').notNull().default(15),
  defaultVatMode: text('default_vat_mode').$type<VatMode>().notNull().default('exclusive'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  archivedAt: integer('archived_at', { mode: 'timestamp' }),
});
export type EntityRow = typeof entities.$inferSelect;
export type NewEntityRow = typeof entities.$inferInsert;

import { integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { entities } from '../entities';
import { inventoryCategories } from '../inventoryCategories';
import { unitsOfMeasure } from '../unitsOfMeasure';

export const inventoryItems = sqliteTable(
  'inventory_items',
  {
    id: text('id').primaryKey(),
    entityId: text('entity_id')
      .notNull()
      .references(() => entities.id, { onDelete: 'cascade' }),
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
    archivedAt: integer('archived_at', { mode: 'timestamp' }),
  },
  (t) => ({
    nameEntityUnique: uniqueIndex('inventory_items_name_entity_idx').on(t.entityId, t.name),
  }),
);
export type InventoryItemRow = typeof inventoryItems.$inferSelect;
export type NewInventoryItemRow = typeof inventoryItems.$inferInsert;

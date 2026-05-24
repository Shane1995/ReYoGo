import { asc, eq } from 'drizzle-orm';
import type { IInventoryCategory, IInventoryItem } from '@reyogo/types';
import type { DbClient } from '../client';
import * as schema from '../schema';
import type { InventoryCategoryRow, InventoryItemRow } from '../schema';
import { now } from '../utils/timestamps';

function toCategory(row: InventoryCategoryRow): IInventoryCategory {
  return { id: row.id, name: row.name, type: row.type };
}

function toItem(row: InventoryItemRow, type: IInventoryCategory['type']): IInventoryItem {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.categoryId,
    type,
    unitOfMeasure: (row.unitOfMeasure as IInventoryItem['unitOfMeasure']) ?? undefined,
  };
}

export function createInventoryRepo(db: DbClient) {
  return {
    async getCategories(): Promise<IInventoryCategory[]> {
      const rows = await db
        .select()
        .from(schema.inventoryCategories)
        .orderBy(schema.inventoryCategories.name);
      return rows.map(toCategory);
    },

    async getItems(): Promise<IInventoryItem[]> {
      const rows = await db
        .select({ item: schema.inventoryItems, categoryType: schema.inventoryCategories.type })
        .from(schema.inventoryItems)
        .innerJoin(
          schema.inventoryCategories,
          eq(schema.inventoryItems.categoryId, schema.inventoryCategories.id),
        )
        .orderBy(asc(schema.inventoryItems.name));
      return rows.map((r) => toItem(r.item, r.categoryType));
    },

    async upsertCategory(category: IInventoryCategory): Promise<void> {
      const ts = now();
      await db
        .insert(schema.inventoryCategories)
        .values({
          id: category.id,
          accountId: 'default',
          name: category.name,
          type: category.type,
          createdAt: ts,
          updatedAt: ts,
        })
        .onConflictDoUpdate({
          target: schema.inventoryCategories.id,
          set: { name: category.name, type: category.type, updatedAt: ts },
        });
    },

    async upsertItem(item: IInventoryItem): Promise<void> {
      const ts = now();
      await db
        .insert(schema.inventoryItems)
        .values({
          id: item.id,
          accountId: 'default',
          name: item.name,
          categoryId: item.categoryId,
          unitOfMeasure: item.unitOfMeasure ?? null,
          createdAt: ts,
          updatedAt: ts,
        })
        .onConflictDoUpdate({
          target: schema.inventoryItems.id,
          set: {
            name: item.name,
            categoryId: item.categoryId,
            unitOfMeasure: item.unitOfMeasure ?? null,
            updatedAt: ts,
          },
        });
    },

    async deleteCategory(id: string): Promise<void> {
      await db.delete(schema.inventoryCategories).where(eq(schema.inventoryCategories.id, id));
    },

    async deleteItem(id: string): Promise<void> {
      await db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, id));
    },
  };
}

import { asc, eq } from 'drizzle-orm';
import type { IInventoryCategory, IInventoryItem } from '@shared/types/contract';
import { getDb, schema } from '../../db';
import type { InventoryCategoryRow, InventoryItemRow } from '../../db/drizzle/schema';

const now = () => new Date();

function toCategory(row: InventoryCategoryRow): IInventoryCategory {
  return {
    id: row.id,
    name: row.name,
    type: row.type as IInventoryCategory['type'],
  };
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

export async function getCategories(): Promise<IInventoryCategory[]> {
  const rows = await getDb()
    .select()
    .from(schema.inventoryCategories)
    .orderBy(schema.inventoryCategories.name);
  return rows.map(toCategory);
}

export async function getItems(): Promise<IInventoryItem[]> {
  const rows = await getDb()
    .select({
      item: schema.inventoryItems,
      categoryType: schema.inventoryCategories.type,
    })
    .from(schema.inventoryItems)
    .innerJoin(
      schema.inventoryCategories,
      eq(schema.inventoryItems.categoryId, schema.inventoryCategories.id)
    )
    .orderBy(asc(schema.inventoryItems.name));
  return rows.map((r) => toItem(r.item, r.categoryType as IInventoryCategory['type']));
}

export async function upsertCategory(category: IInventoryCategory): Promise<void> {
  const db = getDb();
  const existing = await db
    .select()
    .from(schema.inventoryCategories)
    .where(eq(schema.inventoryCategories.id, category.id))
    .limit(1);
  const ts = now();
  if (existing.length > 0) {
    await db
      .update(schema.inventoryCategories)
      .set({
        name: category.name,
        type: category.type,
        updatedAt: ts,
      })
      .where(eq(schema.inventoryCategories.id, category.id));
  } else {
    await db.insert(schema.inventoryCategories).values({
      id: category.id,
      name: category.name,
      type: category.type,
      createdAt: ts,
      updatedAt: ts,
    });
  }
}

export async function upsertItem(item: IInventoryItem): Promise<void> {
  const db = getDb();
  const existing = await db
    .select()
    .from(schema.inventoryItems)
    .where(eq(schema.inventoryItems.id, item.id))
    .limit(1);
  const ts = now();
  if (existing.length > 0) {
    await db
      .update(schema.inventoryItems)
      .set({
        name: item.name,
        categoryId: item.categoryId,
        unitOfMeasure: item.unitOfMeasure ?? null,
        updatedAt: ts,
      })
      .where(eq(schema.inventoryItems.id, item.id));
  } else {
    await db.insert(schema.inventoryItems).values({
      id: item.id,
      name: item.name,
      categoryId: item.categoryId,
      unitOfMeasure: item.unitOfMeasure ?? null,
      createdAt: ts,
      updatedAt: ts,
    });
  }
}

export async function deleteCategory(id: string): Promise<void> {
  await getDb()
    .delete(schema.inventoryCategories)
    .where(eq(schema.inventoryCategories.id, id));
}

export async function deleteItem(id: string): Promise<void> {
  await getDb()
    .delete(schema.inventoryItems)
    .where(eq(schema.inventoryItems.id, id));
}

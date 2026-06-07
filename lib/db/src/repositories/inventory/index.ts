import { and, asc, count, desc, eq, isNotNull, isNull } from 'drizzle-orm';
import type {
  Category,
  InventoryItem,
  InventoryItemInput,
  InventorySubmitPayload,
} from '@reyogo/types';
import type { DbClient } from '../../client';
import * as schema from '../../schema';
import { now } from '../../utils/timestamps';

async function getCategories(db: DbClient): Promise<Category[]> {
  const rows = await db
    .select()
    .from(schema.inventoryCategories)
    .where(isNull(schema.inventoryCategories.archivedAt))
    .orderBy(schema.inventoryCategories.name);
  return rows.map((r) => ({ id: r.id, name: r.name, type: r.type }));
}

async function getItems(db: DbClient, entityId?: string): Promise<InventoryItem[]> {
  const itemRows = await db
    .select()
    .from(schema.inventoryItems)
    .where(
      and(
        isNull(schema.inventoryItems.archivedAt),
        entityId ? eq(schema.inventoryItems.entityId, entityId) : undefined,
      ),
    )
    .orderBy(asc(schema.inventoryItems.name));

  const movementRows = await db
    .select({
      inventoryItemId: schema.stockMovements.inventoryItemId,
      stockQtyAfter: schema.stockMovements.stockQtyAfter,
      weightedAvgCostAfter: schema.stockMovements.weightedAvgCostAfter,
    })
    .from(schema.stockMovements)
    .orderBy(desc(schema.stockMovements.occurredAt), desc(schema.stockMovements.createdAt));

  const stockMap = new Map<
    string,
    { stockQtyAfter: number; weightedAvgCostAfter: number | null }
  >();
  for (const m of movementRows) {
    if (!stockMap.has(m.inventoryItemId)) {
      stockMap.set(m.inventoryItemId, {
        stockQtyAfter: m.stockQtyAfter,
        weightedAvgCostAfter: m.weightedAvgCostAfter ?? null,
      });
    }
  }

  return itemRows.map((row) => {
    const stock = stockMap.get(row.id);
    return {
      id: row.id,
      entityId: row.entityId,
      name: row.name,
      categoryId: row.categoryId,
      unitOfMeasureId: row.unitOfMeasureId ?? null,
      sku: row.sku ?? null,
      currentStockQty: stock?.stockQtyAfter ?? 0,
      currentWeightedAvgCost: stock?.weightedAvgCostAfter ?? null,
      reorderPoint: row.reorderPoint ?? null,
      reorderQty: row.reorderQty ?? null,
    };
  });
}

async function upsertCategory(db: DbClient, category: Category, accountId: string): Promise<void> {
  const ts = now();
  await db
    .insert(schema.inventoryCategories)
    .values({
      id: category.id,
      accountId,
      name: category.name,
      type: category.type,
      createdAt: ts,
      updatedAt: ts,
    })
    .onConflictDoUpdate({
      target: schema.inventoryCategories.id,
      set: { name: category.name, type: category.type, updatedAt: ts },
    });
}

async function upsertItem(db: DbClient, item: InventoryItemInput, entityId: string): Promise<void> {
  const ts = now();
  await db
    .insert(schema.inventoryItems)
    .values({
      id: item.id,
      entityId,
      name: item.name,
      categoryId: item.categoryId,
      unitOfMeasureId: item.unitOfMeasureId ?? null,
      sku: item.sku ?? null,
      reorderPoint: item.reorderPoint ?? null,
      reorderQty: item.reorderQty ?? null,
      createdAt: ts,
      updatedAt: ts,
    })
    .onConflictDoUpdate({
      target: schema.inventoryItems.id,
      set: {
        name: item.name,
        categoryId: item.categoryId,
        unitOfMeasureId: item.unitOfMeasureId ?? null,
        sku: item.sku ?? null,
        reorderPoint: item.reorderPoint ?? null,
        reorderQty: item.reorderQty ?? null,
        updatedAt: ts,
      },
    });
}

async function submitInventory(
  db: DbClient,
  payload: InventorySubmitPayload,
  accountId: string,
  entityId: string,
): Promise<void> {
  for (const cat of payload.addedCategories) await upsertCategory(db, cat, accountId);
  for (const cat of payload.updatedCategories) await upsertCategory(db, cat, accountId);
  for (const item of payload.addedItems) await upsertItem(db, item, entityId);
  for (const item of payload.updatedItems) await upsertItem(db, item, entityId);
  for (const id of payload.deletedCategoryIds)
    await db.delete(schema.inventoryCategories).where(eq(schema.inventoryCategories.id, id));
  for (const id of payload.deletedItemIds)
    await db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, id));
}

async function deleteCategory(db: DbClient, id: string): Promise<void> {
  await db.delete(schema.inventoryCategories).where(eq(schema.inventoryCategories.id, id));
}

async function deleteItem(db: DbClient, id: string): Promise<void> {
  await db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, id));
}

async function getArchivedItems(db: DbClient): Promise<InventoryItem[]> {
  const rows = await db
    .select()
    .from(schema.inventoryItems)
    .where(isNotNull(schema.inventoryItems.archivedAt))
    .orderBy(asc(schema.inventoryItems.name));
  return rows.map((row) => ({
    id: row.id,
    entityId: row.entityId,
    name: row.name,
    categoryId: row.categoryId,
    unitOfMeasureId: row.unitOfMeasureId ?? null,
    sku: row.sku ?? null,
    currentStockQty: 0,
    currentWeightedAvgCost: null,
    reorderPoint: row.reorderPoint ?? null,
    reorderQty: row.reorderQty ?? null,
  }));
}

async function getItemUsageCount(db: DbClient, id: string): Promise<number> {
  const [lines] = await db
    .select({ n: count() })
    .from(schema.invoiceLineItems)
    .where(eq(schema.invoiceLineItems.inventoryItemId, id));
  const [movements] = await db
    .select({ n: count() })
    .from(schema.stockMovements)
    .where(eq(schema.stockMovements.inventoryItemId, id));
  return (lines?.n ?? 0) + (movements?.n ?? 0);
}

async function archiveItem(db: DbClient, id: string): Promise<void> {
  await db
    .update(schema.inventoryItems)
    .set({ archivedAt: now() })
    .where(eq(schema.inventoryItems.id, id));
}

async function restoreItem(db: DbClient, id: string): Promise<void> {
  await db
    .update(schema.inventoryItems)
    .set({ archivedAt: null })
    .where(eq(schema.inventoryItems.id, id));
}

async function hardDeleteItem(db: DbClient, id: string): Promise<void> {
  const usage = await getItemUsageCount(db, id);
  if (usage > 0) throw new Error(`Item has ${usage} usages and cannot be deleted.`);
  await db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, id));
}

async function getArchivedCategories(db: DbClient): Promise<Category[]> {
  const rows = await db
    .select()
    .from(schema.inventoryCategories)
    .where(isNotNull(schema.inventoryCategories.archivedAt))
    .orderBy(schema.inventoryCategories.name);
  return rows.map((r) => ({ id: r.id, name: r.name, type: r.type }));
}

async function getCategoryUsageCount(db: DbClient, id: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(schema.inventoryItems)
    .where(eq(schema.inventoryItems.categoryId, id));
  return row?.n ?? 0;
}

async function archiveCategory(db: DbClient, id: string): Promise<void> {
  const ts = now();
  await db
    .update(schema.inventoryCategories)
    .set({ archivedAt: ts })
    .where(eq(schema.inventoryCategories.id, id));
  await db
    .update(schema.inventoryItems)
    .set({ archivedAt: ts })
    .where(and(eq(schema.inventoryItems.categoryId, id), isNull(schema.inventoryItems.archivedAt)));
}

async function restoreCategory(db: DbClient, id: string): Promise<void> {
  await db
    .update(schema.inventoryCategories)
    .set({ archivedAt: null })
    .where(eq(schema.inventoryCategories.id, id));
  await db
    .update(schema.inventoryItems)
    .set({ archivedAt: null })
    .where(eq(schema.inventoryItems.categoryId, id));
}

async function hardDeleteCategory(db: DbClient, id: string): Promise<void> {
  const usage = await getCategoryUsageCount(db, id);
  if (usage > 0) throw new Error(`Category has ${usage} assigned items and cannot be deleted.`);
  await db.delete(schema.inventoryCategories).where(eq(schema.inventoryCategories.id, id));
}

export function createInventoryRepo(db: DbClient) {
  return {
    getCategories: () => getCategories(db),
    getItems: (entityId?: string) => getItems(db, entityId),
    upsertCategory: (category: Category, accountId: string) =>
      upsertCategory(db, category, accountId),
    upsertItem: (item: InventoryItemInput, entityId: string) => upsertItem(db, item, entityId),
    submitInventory: (payload: InventorySubmitPayload, accountId: string, entityId: string) =>
      submitInventory(db, payload, accountId, entityId),
    deleteCategory: (id: string) => deleteCategory(db, id),
    deleteItem: (id: string) => deleteItem(db, id),
    getArchivedItems: () => getArchivedItems(db),
    getItemUsageCount: (id: string) => getItemUsageCount(db, id),
    archiveItem: (id: string) => archiveItem(db, id),
    restoreItem: (id: string) => restoreItem(db, id),
    hardDeleteItem: (id: string) => hardDeleteItem(db, id),
    getArchivedCategories: () => getArchivedCategories(db),
    getCategoryUsageCount: (id: string) => getCategoryUsageCount(db, id),
    archiveCategory: (id: string) => archiveCategory(db, id),
    restoreCategory: (id: string) => restoreCategory(db, id),
    hardDeleteCategory: (id: string) => hardDeleteCategory(db, id),
  };
}

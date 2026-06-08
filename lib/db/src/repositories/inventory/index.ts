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

function orNull<T>(value: T | null | undefined): T | null {
  if (value == null) return null;
  return value;
}

type StockEntry = { stockQtyAfter: number; weightedAvgCostAfter: number | null } | undefined;

function stockQtyOf(stock: StockEntry): number {
  if (!stock) return 0;
  return stock.stockQtyAfter;
}

function weightedAvgCostOf(stock: StockEntry): number | null {
  if (!stock) return null;
  return stock.weightedAvgCostAfter;
}

function countOf(row: { n: number } | undefined): number {
  if (!row) return 0;
  return row.n;
}

function entityFilter(entityId: string | undefined) {
  if (!entityId) return undefined;
  return eq(schema.inventoryItems.entityId, entityId);
}

function toInventoryItem(row: schema.InventoryItemRow, stock: StockEntry): InventoryItem {
  return {
    id: row.id,
    entityId: row.entityId,
    name: row.name,
    categoryId: row.categoryId,
    unitOfMeasureId: orNull(row.unitOfMeasureId),
    sku: orNull(row.sku),
    currentStockQty: stockQtyOf(stock),
    currentWeightedAvgCost: weightedAvgCostOf(stock),
    reorderPoint: orNull(row.reorderPoint),
    reorderQty: orNull(row.reorderQty),
  };
}

function toArchivedItem(row: schema.InventoryItemRow): InventoryItem {
  return {
    id: row.id,
    entityId: row.entityId,
    name: row.name,
    categoryId: row.categoryId,
    unitOfMeasureId: orNull(row.unitOfMeasureId),
    sku: orNull(row.sku),
    currentStockQty: 0,
    currentWeightedAvgCost: null,
    reorderPoint: orNull(row.reorderPoint),
    reorderQty: orNull(row.reorderQty),
  };
}

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
    .where(and(isNull(schema.inventoryItems.archivedAt), entityFilter(entityId)))
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
    if (stockMap.has(m.inventoryItemId)) continue;
    stockMap.set(m.inventoryItemId, {
      stockQtyAfter: m.stockQtyAfter,
      weightedAvgCostAfter: orNull(m.weightedAvgCostAfter),
    });
  }

  return itemRows.map((row) => toInventoryItem(row, stockMap.get(row.id)));
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

function normalizedItemFields(item: InventoryItemInput) {
  return {
    name: item.name,
    categoryId: item.categoryId,
    unitOfMeasureId: orNull(item.unitOfMeasureId),
    sku: orNull(item.sku),
    reorderPoint: orNull(item.reorderPoint),
    reorderQty: orNull(item.reorderQty),
  };
}

async function upsertItem(db: DbClient, item: InventoryItemInput, entityId: string): Promise<void> {
  const ts = now();
  const fields = normalizedItemFields(item);
  await db
    .insert(schema.inventoryItems)
    .values({
      id: item.id,
      entityId,
      ...fields,
      createdAt: ts,
      updatedAt: ts,
    })
    .onConflictDoUpdate({
      target: schema.inventoryItems.id,
      set: {
        ...fields,
        updatedAt: ts,
      },
    });
}

async function upsertCategories(
  db: DbClient,
  categories: Category[],
  accountId: string,
): Promise<void> {
  for (const cat of categories) await upsertCategory(db, cat, accountId);
}

async function upsertItems(
  db: DbClient,
  items: InventoryItemInput[],
  entityId: string,
): Promise<void> {
  for (const item of items) await upsertItem(db, item, entityId);
}

async function deleteCategoriesByIds(db: DbClient, ids: string[]): Promise<void> {
  for (const id of ids) {
    await db.delete(schema.inventoryCategories).where(eq(schema.inventoryCategories.id, id));
  }
}

async function deleteItemsByIds(db: DbClient, ids: string[]): Promise<void> {
  for (const id of ids) {
    await db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, id));
  }
}

async function submitInventory(
  db: DbClient,
  payload: InventorySubmitPayload,
  accountId: string,
  entityId: string,
): Promise<void> {
  await upsertCategories(db, payload.addedCategories, accountId);
  await upsertCategories(db, payload.updatedCategories, accountId);
  await upsertItems(db, payload.addedItems, entityId);
  await upsertItems(db, payload.updatedItems, entityId);
  await deleteCategoriesByIds(db, payload.deletedCategoryIds);
  await deleteItemsByIds(db, payload.deletedItemIds);
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
  return rows.map((row) => toArchivedItem(row));
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
  return countOf(lines) + countOf(movements);
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

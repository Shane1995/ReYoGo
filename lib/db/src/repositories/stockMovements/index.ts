import { and, asc, desc, eq, gte, lte } from 'drizzle-orm';
import { MovementType } from '@reyogo/types';
import type { COGSSummary, ItemCostHistory, StockMovement } from '@reyogo/types';
import type { DbClient } from '../../client';
import * as schema from '../../schema';

type WacRow = {
  inventoryItemId: string;
  entityId: string;
  weightedAvgCostAfter: number | null;
  occurredAt: Date;
};

type CatRow = {
  qty: number;
  unitCostAtTime: number | null;
  categoryId: string | null;
  categoryName: string | null;
};

type CatAccum = { categoryId: string | null; categoryName: string | null; total: number };

function entityFilter(entityId: string | undefined) {
  if (!entityId) return undefined;
  return eq(schema.stockMovements.entityId, entityId);
}

function orNull<T>(value: T | null | undefined): T | null {
  if (value == null) return null;
  return value;
}

function appendWac(
  itemWacs: Map<string, (number | null)[]>,
  itemId: string,
  wac: number | null,
): void {
  const existing = itemWacs.get(itemId);
  if (existing) {
    existing.push(wac);
    return;
  }
  itemWacs.set(itemId, [wac]);
}

function aggregateEntityWacs(rows: WacRow[]): Map<string, (number | null)[]> {
  const latestWac = new Map<string, number | null>();
  for (const row of rows) {
    latestWac.set(`${row.inventoryItemId}::${row.entityId}`, orNull(row.weightedAvgCostAfter));
  }
  const itemWacs = new Map<string, (number | null)[]>();
  for (const [key, wac] of latestWac) {
    appendWac(itemWacs, key.split('::')[0]!, wac);
  }
  return itemWacs;
}

function categoryKeyOf(categoryId: string | null): string {
  if (categoryId === null) return '__uncategorised';
  return categoryId;
}

function ensureCategoryEntry(catMap: Map<string, CatAccum>, row: CatRow): CatAccum {
  const key = categoryKeyOf(row.categoryId);
  const existing = catMap.get(key);
  if (existing) return existing;
  const entry: CatAccum = {
    categoryId: orNull(row.categoryId),
    categoryName: orNull(row.categoryName),
    total: 0,
  };
  catMap.set(key, entry);
  return entry;
}

function unitCostOf(value: number | null): number {
  if (value === null) return 0;
  return value;
}

function aggregateCogsByCategory(rows: CatRow[]): { total: number; catMap: Map<string, CatAccum> } {
  let total = 0;
  const catMap = new Map<string, CatAccum>();
  for (const row of rows) {
    const amount = row.qty * unitCostOf(row.unitCostAtTime);
    total += amount;
    ensureCategoryEntry(catMap, row).total += amount;
  }
  return { total, catMap };
}

type StockRow = { inventoryItemId: string; entityId: string; stockQtyAfter: number };

function stockByItemForEntity(rows: StockRow[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const row of rows) result[row.inventoryItemId] = row.stockQtyAfter;
  return result;
}

function addToStock(result: Record<string, number>, itemId: string, qty: number): void {
  const existing = result[itemId];
  if (existing === undefined) {
    result[itemId] = qty;
    return;
  }
  result[itemId] = existing + qty;
}

function stockAcrossEntities(rows: StockRow[]): Record<string, number> {
  const perEntityItem = new Map<string, number>();
  for (const row of rows) {
    perEntityItem.set(`${row.inventoryItemId}::${row.entityId}`, row.stockQtyAfter);
  }
  const result: Record<string, number> = {};
  for (const [key, qty] of perEntityItem) addToStock(result, key.split('::')[0]!, qty);
  return result;
}

async function getCurrentStockByItem(
  db: DbClient,
  entityId?: string,
): Promise<Record<string, number>> {
  const rows = await db
    .select({
      inventoryItemId: schema.stockMovements.inventoryItemId,
      entityId: schema.stockMovements.entityId,
      stockQtyAfter: schema.stockMovements.stockQtyAfter,
      occurredAt: schema.stockMovements.occurredAt,
    })
    .from(schema.stockMovements)
    .where(entityFilter(entityId))
    .orderBy(asc(schema.stockMovements.occurredAt));

  if (entityId) return stockByItemForEntity(rows);
  return stockAcrossEntities(rows);
}

function wacConditions(entityId: string | undefined) {
  const conditions = [eq(schema.stockMovements.movementType, MovementType.In)];
  if (entityId) conditions.push(eq(schema.stockMovements.entityId, entityId));
  return conditions;
}

function wacByItemForEntity(rows: WacRow[]): Record<string, number | null> {
  const result: Record<string, number | null> = {};
  for (const row of rows) result[row.inventoryItemId] = orNull(row.weightedAvgCostAfter);
  return result;
}

function reconciledWac(wacs: (number | null)[]): number | null {
  const allSame = wacs.every((w) => w === wacs[0]);
  if (!allSame) return null;
  return orNull(wacs[0]);
}

function wacAcrossEntities(rows: WacRow[]): Record<string, number | null> {
  const itemWacs = aggregateEntityWacs(rows);
  const result: Record<string, number | null> = {};
  for (const [itemId, wacs] of itemWacs) result[itemId] = reconciledWac(wacs);
  return result;
}

async function getWeightedAvgCosts(
  db: DbClient,
  entityId?: string,
): Promise<Record<string, number | null>> {
  const rows = await db
    .select({
      inventoryItemId: schema.stockMovements.inventoryItemId,
      entityId: schema.stockMovements.entityId,
      weightedAvgCostAfter: schema.stockMovements.weightedAvgCostAfter,
      occurredAt: schema.stockMovements.occurredAt,
    })
    .from(schema.stockMovements)
    .where(and(...wacConditions(entityId)))
    .orderBy(asc(schema.stockMovements.occurredAt));

  if (entityId) return wacByItemForEntity(rows);
  return wacAcrossEntities(rows);
}

function toStockMovement(row: schema.StockMovementRow): StockMovement {
  return {
    id: row.id,
    inventoryItemId: row.inventoryItemId,
    movementType: row.movementType,
    qty: row.qty,
    unitCostAtTime: orNull(row.unitCostAtTime),
    totalCost: orNull(row.totalCost),
    weightedAvgCostAfter: orNull(row.weightedAvgCostAfter),
    stockQtyAfter: row.stockQtyAfter,
    referenceType: orNull(row.referenceType),
    referenceId: orNull(row.referenceId),
    notes: orNull(row.notes),
    occurredAt: row.occurredAt,
    createdAt: row.createdAt,
  };
}

async function getMovementsForItem(
  db: DbClient,
  itemId: string,
  entityId?: string,
): Promise<StockMovement[]> {
  const conditions = [eq(schema.stockMovements.inventoryItemId, itemId)];
  if (entityId) conditions.push(eq(schema.stockMovements.entityId, entityId));
  const rows = await db
    .select()
    .from(schema.stockMovements)
    .where(and(...conditions))
    .orderBy(desc(schema.stockMovements.occurredAt), desc(schema.stockMovements.createdAt));
  return rows.map((r) => toStockMovement(r));
}

function weightedAvgCostOf(movement: StockMovement | undefined): number | null {
  if (!movement) return null;
  return movement.weightedAvgCostAfter;
}

function totalStockOf(movement: StockMovement | undefined): number {
  if (!movement) return 0;
  return movement.stockQtyAfter;
}

async function getItemCostHistory(
  db: DbClient,
  itemId: string,
  entityId?: string,
): Promise<ItemCostHistory> {
  const movements = await getMovementsForItem(db, itemId, entityId);
  const latestIn = movements.find((m) => m.movementType === 'IN');
  const latest = movements.at(0);
  return {
    itemId,
    weightedAvgCost: weightedAvgCostOf(latestIn),
    totalStock: totalStockOf(latest),
    movements: movements.map((m) => ({
      id: m.id,
      movementType: m.movementType,
      qty: m.qty,
      unitCostAtTime: m.unitCostAtTime,
      totalCost: m.totalCost,
      weightedAvgCostAfter: m.weightedAvgCostAfter,
      stockQtyAfter: m.stockQtyAfter,
      occurredAt: m.occurredAt,
      createdAt: m.createdAt,
    })),
  };
}

async function getCOGS(
  db: DbClient,
  fromDate?: string,
  toDate?: string,
  entityId?: string,
): Promise<COGSSummary> {
  const conditions = [eq(schema.stockMovements.movementType, MovementType.Out)];
  if (fromDate)
    conditions.push(gte(schema.stockMovements.occurredAt, new Date(fromDate + 'T00:00:00')));
  if (toDate)
    conditions.push(lte(schema.stockMovements.occurredAt, new Date(toDate + 'T23:59:59')));
  if (entityId) conditions.push(eq(schema.stockMovements.entityId, entityId));

  const rows = await db
    .select({
      qty: schema.stockMovements.qty,
      unitCostAtTime: schema.stockMovements.unitCostAtTime,
      categoryId: schema.inventoryCategories.id,
      categoryName: schema.inventoryCategories.name,
    })
    .from(schema.stockMovements)
    .leftJoin(
      schema.inventoryItems,
      eq(schema.stockMovements.inventoryItemId, schema.inventoryItems.id),
    )
    .leftJoin(
      schema.inventoryCategories,
      eq(schema.inventoryItems.categoryId, schema.inventoryCategories.id),
    )
    .where(and(...conditions));

  const { total, catMap } = aggregateCogsByCategory(rows);
  return { total, byCategory: Array.from(catMap.values()).sort((a, b) => b.total - a.total) };
}

export function createStockMovementsRepo(db: DbClient) {
  return {
    getCurrentStockByItem: (entityId?: string) => getCurrentStockByItem(db, entityId),
    getWeightedAvgCosts: (entityId?: string) => getWeightedAvgCosts(db, entityId),
    getMovementsForItem: (itemId: string, entityId?: string) =>
      getMovementsForItem(db, itemId, entityId),
    getItemCostHistory: (itemId: string, entityId?: string) =>
      getItemCostHistory(db, itemId, entityId),
    getCOGS: (fromDate?: string, toDate?: string, entityId?: string) =>
      getCOGS(db, fromDate, toDate, entityId),
  };
}

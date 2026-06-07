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

function aggregateEntityWacs(rows: WacRow[]): Map<string, (number | null)[]> {
  const latestWac = new Map<string, number | null>();
  for (const row of rows) {
    latestWac.set(`${row.inventoryItemId}::${row.entityId}`, row.weightedAvgCostAfter ?? null);
  }
  const itemWacs = new Map<string, (number | null)[]>();
  for (const [key, wac] of latestWac) {
    const itemId = key.split('::')[0]!;
    const arr = itemWacs.get(itemId) ?? [];
    arr.push(wac);
    itemWacs.set(itemId, arr);
  }
  return itemWacs;
}

function aggregateCogsByCategory(rows: CatRow[]): { total: number; catMap: Map<string, CatAccum> } {
  let total = 0;
  const catMap = new Map<string, CatAccum>();
  for (const row of rows) {
    const amount = row.qty * (row.unitCostAtTime ?? 0);
    total += amount;
    const key = row.categoryId ?? '__uncategorised';
    if (!catMap.has(key))
      catMap.set(key, {
        categoryId: row.categoryId ?? null,
        categoryName: row.categoryName ?? null,
        total: 0,
      });
    catMap.get(key)!.total += amount;
  }
  return { total, catMap };
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
    .where(entityId ? eq(schema.stockMovements.entityId, entityId) : undefined)
    .orderBy(asc(schema.stockMovements.occurredAt));

  if (entityId) {
    const result: Record<string, number> = {};
    for (const row of rows) result[row.inventoryItemId] = row.stockQtyAfter;
    return result;
  }

  const perEntityItem = new Map<string, number>();
  for (const row of rows) {
    perEntityItem.set(`${row.inventoryItemId}::${row.entityId}`, row.stockQtyAfter);
  }
  const result: Record<string, number> = {};
  for (const [key, qty] of perEntityItem) {
    const itemId = key.split('::')[0]!;
    result[itemId] = (result[itemId] ?? 0) + qty;
  }
  return result;
}

async function getWeightedAvgCosts(
  db: DbClient,
  entityId?: string,
): Promise<Record<string, number | null>> {
  const conditions = [eq(schema.stockMovements.movementType, MovementType.In)];
  if (entityId) conditions.push(eq(schema.stockMovements.entityId, entityId));

  const rows = await db
    .select({
      inventoryItemId: schema.stockMovements.inventoryItemId,
      entityId: schema.stockMovements.entityId,
      weightedAvgCostAfter: schema.stockMovements.weightedAvgCostAfter,
      occurredAt: schema.stockMovements.occurredAt,
    })
    .from(schema.stockMovements)
    .where(and(...conditions))
    .orderBy(asc(schema.stockMovements.occurredAt));

  if (entityId) {
    const result: Record<string, number | null> = {};
    for (const row of rows) result[row.inventoryItemId] = row.weightedAvgCostAfter ?? null;
    return result;
  }

  const itemWacs = aggregateEntityWacs(rows);
  const result: Record<string, number | null> = {};
  for (const [itemId, wacs] of itemWacs) {
    const allSame = wacs.every((w) => w === wacs[0]);
    result[itemId] = allSame ? (wacs[0] ?? null) : null;
  }
  return result;
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
  return rows.map((r) => ({
    id: r.id,
    inventoryItemId: r.inventoryItemId,
    movementType: r.movementType,
    qty: r.qty,
    unitCostAtTime: r.unitCostAtTime ?? null,
    totalCost: r.totalCost ?? null,
    weightedAvgCostAfter: r.weightedAvgCostAfter ?? null,
    stockQtyAfter: r.stockQtyAfter,
    referenceType: r.referenceType ?? null,
    referenceId: r.referenceId ?? null,
    notes: r.notes ?? null,
    occurredAt: r.occurredAt,
    createdAt: r.createdAt,
  }));
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
    weightedAvgCost: latestIn?.weightedAvgCostAfter ?? null,
    totalStock: latest?.stockQtyAfter ?? 0,
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

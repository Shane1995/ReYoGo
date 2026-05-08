import { eq, sql, and, gte, lte } from 'drizzle-orm';
import type { IItemCostHistory, ICOGSSummary, IStockMovement, StockMovementSource, StockMovementType } from '@shared/types/contract';
import { getDb, schema } from '../../db';

export async function getCurrentStockByItem(): Promise<Record<string, number>> {
  const rows = await getDb()
    .select({
      itemId: schema.stockMovements.itemId,
      netQty: sql<number>`SUM(CASE WHEN type = 'IN' THEN quantity WHEN type = 'OUT' THEN -quantity ELSE quantity END)`,
    })
    .from(schema.stockMovements)
    .groupBy(schema.stockMovements.itemId);

  return Object.fromEntries(rows.map((r) => [r.itemId, r.netQty ?? 0]));
}

export async function getMovementsForItem(itemId: string): Promise<IStockMovement[]> {
  const rows = await getDb()
    .select()
    .from(schema.stockMovements)
    .where(eq(schema.stockMovements.itemId, itemId));

  return rows.map((r) => ({
    id: r.id,
    itemId: r.itemId,
    itemNameSnapshot: r.itemNameSnapshot,
    type: r.type as StockMovementType,
    quantity: r.quantity,
    source: r.source as StockMovementSource,
    referenceId: r.referenceId,
    costAtTime: r.costAtTime,
    cogsAmount: r.cogsAmount,
    createdAt: r.createdAt,
  }));
}

export async function getWeightedAvgCosts(): Promise<Record<string, number | null>> {
  const rows = await getDb()
    .select({ id: schema.inventoryItems.id, weightedAvgCost: schema.inventoryItems.weightedAvgCost })
    .from(schema.inventoryItems);
  return Object.fromEntries(rows.map((r) => [r.id, r.weightedAvgCost ?? null]));
}

export async function getItemCostHistory(itemId: string): Promise<IItemCostHistory> {
  const db = getDb();
  const [item] = await db
    .select({ weightedAvgCost: schema.inventoryItems.weightedAvgCost, totalStock: schema.inventoryItems.totalStock })
    .from(schema.inventoryItems)
    .where(eq(schema.inventoryItems.id, itemId));

  const movements = await db
    .select()
    .from(schema.stockMovements)
    .where(eq(schema.stockMovements.itemId, itemId));

  return {
    itemId,
    weightedAvgCost: item?.weightedAvgCost ?? null,
    totalStock: item?.totalStock ?? 0,
    movements: movements.map((r) => ({
      id: r.id,
      type: r.type as StockMovementType,
      quantity: r.quantity,
      costAtTime: r.costAtTime ?? null,
      cogsAmount: r.cogsAmount ?? null,
      createdAt: r.createdAt,
    })),
  };
}

export async function getCOGS(fromDate?: string, toDate?: string): Promise<ICOGSSummary> {
  const db = getDb();
  const conditions = [eq(schema.stockMovements.type, 'OUT')];
  if (fromDate) conditions.push(gte(schema.stockMovements.createdAt, new Date(fromDate + 'T00:00:00')));
  if (toDate) conditions.push(lte(schema.stockMovements.createdAt, new Date(toDate + 'T23:59:59')));

  const rows = await db
    .select({
      cogsAmount: schema.stockMovements.cogsAmount,
      categoryId: schema.inventoryCategories.id,
      categoryName: schema.inventoryCategories.name,
    })
    .from(schema.stockMovements)
    .leftJoin(schema.inventoryItems, eq(schema.stockMovements.itemId, schema.inventoryItems.id))
    .leftJoin(schema.inventoryCategories, eq(schema.inventoryItems.categoryId, schema.inventoryCategories.id))
    .where(and(...conditions));

  let total = 0;
  const catMap = new Map<string, { categoryId: string | null; categoryName: string | null; total: number }>();
  for (const row of rows) {
    const amount = row.cogsAmount ?? 0;
    total += amount;
    const key = row.categoryId ?? '__uncategorised';
    if (!catMap.has(key)) catMap.set(key, { categoryId: row.categoryId ?? null, categoryName: row.categoryName ?? null, total: 0 });
    catMap.get(key)!.total += amount;
  }

  return {
    total,
    byCategory: Array.from(catMap.values()).sort((a, b) => b.total - a.total),
  };
}

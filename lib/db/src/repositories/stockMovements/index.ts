import { and, asc, eq, gte, lte } from 'drizzle-orm';
import { MovementType } from '@reyogo/types';
import type { COGSSummary, ItemCostHistory, StockMovement } from '@reyogo/types';
import type { DbClient } from '../../client';
import * as schema from '../../schema';

export function createStockMovementsRepo(db: DbClient) {
  return {
    async getCurrentStockByItem(): Promise<Record<string, number>> {
      const rows = await db
        .select({
          inventoryItemId: schema.stockMovements.inventoryItemId,
          stockQtyAfter: schema.stockMovements.stockQtyAfter,
          occurredAt: schema.stockMovements.occurredAt,
        })
        .from(schema.stockMovements)
        .orderBy(asc(schema.stockMovements.occurredAt));
      const result: Record<string, number> = {};
      for (const row of rows) result[row.inventoryItemId] = row.stockQtyAfter;
      return result;
    },

    async getWeightedAvgCosts(): Promise<Record<string, number | null>> {
      const rows = await db
        .select({
          inventoryItemId: schema.stockMovements.inventoryItemId,
          weightedAvgCostAfter: schema.stockMovements.weightedAvgCostAfter,
          occurredAt: schema.stockMovements.occurredAt,
        })
        .from(schema.stockMovements)
        .where(eq(schema.stockMovements.movementType, MovementType.In))
        .orderBy(asc(schema.stockMovements.occurredAt));
      const result: Record<string, number | null> = {};
      for (const row of rows) result[row.inventoryItemId] = row.weightedAvgCostAfter ?? null;
      return result;
    },

    async getMovementsForItem(itemId: string): Promise<StockMovement[]> {
      const rows = await db
        .select()
        .from(schema.stockMovements)
        .where(eq(schema.stockMovements.inventoryItemId, itemId))
        .orderBy(schema.stockMovements.occurredAt);
      rows.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
      return rows.map((r) => ({
        id: r.id,
        inventoryItemId: r.inventoryItemId,
        movementType: r.movementType,
        qty: r.qty,
        unitCostAtTime: r.unitCostAtTime ?? null,
        totalCost: r.totalCost ?? null,
        weightedAvgCostAfter: r.weightedAvgCostAfter ?? null,
        stockQtyAfter: r.stockQtyAfter,
        referenceType: r.referenceType,
        referenceId: r.referenceId ?? null,
        notes: r.notes ?? null,
        occurredAt: r.occurredAt,
        createdAt: r.createdAt,
      }));
    },

    async getItemCostHistory(itemId: string): Promise<ItemCostHistory> {
      const movements = await this.getMovementsForItem(itemId);
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
    },

    async getCOGS(fromDate?: string, toDate?: string, entityId?: string): Promise<COGSSummary> {
      const conditions = [eq(schema.stockMovements.movementType, MovementType.Out)];
      if (fromDate)
        conditions.push(gte(schema.stockMovements.occurredAt, new Date(fromDate + 'T00:00:00')));
      if (toDate)
        conditions.push(lte(schema.stockMovements.occurredAt, new Date(toDate + 'T23:59:59')));
      if (entityId) conditions.push(eq(schema.inventoryItems.entityId, entityId));

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

      let total = 0;
      const catMap = new Map<
        string,
        { categoryId: string | null; categoryName: string | null; total: number }
      >();
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
      return { total, byCategory: Array.from(catMap.values()).sort((a, b) => b.total - a.total) };
    },
  };
}

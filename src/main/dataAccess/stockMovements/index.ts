import { eq, sql } from 'drizzle-orm';
import type { IStockMovement, StockMovementSource, StockMovementType } from '@shared/types/contract';
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
    createdAt: r.createdAt,
  }));
}

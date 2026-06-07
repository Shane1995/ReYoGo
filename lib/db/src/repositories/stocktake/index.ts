import { desc, eq } from 'drizzle-orm';
import { ReferenceType } from '@reyogo/types';
import type {
  StocktakeSession,
  StocktakeLine,
  StocktakeSessionWithLines,
  CompleteStocktakePayload,
  MovementType,
} from '@reyogo/types';
import type { DbClient } from '../../client';
import * as schema from '../../schema';
import { now } from '../../utils/timestamps';
import { generateId } from '../../utils/ids';

type TxClient = Parameters<DbClient['transaction']>[0] extends (tx: infer T) => Promise<unknown>
  ? T
  : never;

function toSession(row: schema.StockCountSessionRow): StocktakeSession {
  return {
    id: row.id,
    accountId: row.accountId,
    label: row.label ?? null,
    status: row.status,
    completedAt: row.completedAt ?? null,
    createdAt: row.createdAt,
  };
}

function toLine(row: schema.StockCountLineRow): StocktakeLine {
  return {
    id: row.id,
    sessionId: row.sessionId,
    inventoryItemId: row.inventoryItemId,
    countedQty: row.countedQty,
    notes: row.notes ?? null,
  };
}

async function getLatestStockQty(tx: TxClient, itemId: string): Promise<number> {
  const rows = await tx
    .select({ stockQtyAfter: schema.stockMovements.stockQtyAfter })
    .from(schema.stockMovements)
    .where(eq(schema.stockMovements.inventoryItemId, itemId))
    .orderBy(desc(schema.stockMovements.occurredAt), desc(schema.stockMovements.createdAt))
    .limit(1);
  return rows[0]?.stockQtyAfter ?? 0;
}

async function createSession(db: DbClient, label?: string): Promise<StocktakeSession> {
  const ts = now();
  const id = generateId();
  await db.insert(schema.stockCountSessions).values({
    id,
    accountId: 'default',
    label: label ?? null,
    status: 'open',
    createdAt: ts,
  });
  const rows = await db
    .select()
    .from(schema.stockCountSessions)
    .where(eq(schema.stockCountSessions.id, id))
    .limit(1);
  return toSession(rows[0]!);
}

async function getSessions(db: DbClient): Promise<StocktakeSession[]> {
  const rows = await db
    .select()
    .from(schema.stockCountSessions)
    .orderBy(desc(schema.stockCountSessions.createdAt));
  return rows.map(toSession);
}

async function getSessionById(db: DbClient, id: string): Promise<StocktakeSessionWithLines | null> {
  const sessionRows = await db
    .select()
    .from(schema.stockCountSessions)
    .where(eq(schema.stockCountSessions.id, id))
    .limit(1);
  if (!sessionRows[0]) return null;
  const lineRows = await db
    .select()
    .from(schema.stockCountLines)
    .where(eq(schema.stockCountLines.sessionId, id));
  return { ...toSession(sessionRows[0]), lines: lineRows.map(toLine) };
}

async function completeSession(db: DbClient, payload: CompleteStocktakePayload): Promise<void> {
  const completedAt = now();
  await db.transaction(async (tx) => {
    const sessionRows = await tx
      .select()
      .from(schema.stockCountSessions)
      .where(eq(schema.stockCountSessions.id, payload.sessionId))
      .limit(1);
    if (!sessionRows[0]) throw new Error(`Stocktake session not found: ${payload.sessionId}`);
    if (sessionRows[0].status === 'complete')
      throw new Error(`Session already completed: ${payload.sessionId}`);

    await tx
      .delete(schema.stockCountLines)
      .where(eq(schema.stockCountLines.sessionId, payload.sessionId));

    if (payload.lines.length > 0) {
      await tx.insert(schema.stockCountLines).values(
        payload.lines.map((l) => ({
          id: l.id,
          sessionId: payload.sessionId,
          inventoryItemId: l.inventoryItemId,
          countedQty: l.countedQty,
          notes: l.notes ?? null,
        })),
      );
    }

    for (const line of payload.lines) {
      const bookQty = await getLatestStockQty(tx, line.inventoryItemId);
      const variance = line.countedQty - bookQty;
      if (variance === 0) continue;

      const newQty = bookQty + variance;
      await tx.insert(schema.stockMovements).values({
        id: generateId(),
        accountId: 'default',
        entityId: 'default',
        inventoryItemId: line.inventoryItemId,
        movementType: 'ADJUSTMENT' as MovementType,
        qty: variance,
        stockQtyAfter: newQty,
        referenceType: ReferenceType.Adjustment,
        referenceId: payload.sessionId,
        notes: line.notes ?? null,
        occurredAt: completedAt,
        createdAt: completedAt,
      });
    }

    await tx
      .update(schema.stockCountSessions)
      .set({ status: 'complete', completedAt })
      .where(eq(schema.stockCountSessions.id, payload.sessionId));
  });
}

export function createStocktakeRepo(db: DbClient) {
  return {
    createSession: (label?: string) => createSession(db, label),
    getSessions: () => getSessions(db),
    getSessionById: (id: string) => getSessionById(db, id),
    completeSession: (payload: CompleteStocktakePayload) => completeSession(db, payload),
  };
}

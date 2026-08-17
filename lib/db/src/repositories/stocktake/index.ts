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

async function assertSessionCompletable(tx: TxClient, sessionId: string): Promise<void> {
  const sessionRows = await tx
    .select()
    .from(schema.stockCountSessions)
    .where(eq(schema.stockCountSessions.id, sessionId))
    .limit(1);
  if (!sessionRows[0]) throw new Error(`Stocktake session not found: ${sessionId}`);
  if (sessionRows[0].status === 'complete')
    throw new Error(`Session already completed: ${sessionId}`);
}

async function replaceCountedLines(
  tx: TxClient,
  sessionId: string,
  lines: CompleteStocktakePayload['lines'],
): Promise<void> {
  await tx.delete(schema.stockCountLines).where(eq(schema.stockCountLines.sessionId, sessionId));
  if (lines.length === 0) return;
  await tx.insert(schema.stockCountLines).values(
    lines.map((l) => ({
      id: l.id,
      sessionId,
      inventoryItemId: l.inventoryItemId,
      countedQty: l.countedQty,
      notes: l.notes ?? null,
    })),
  );
}

async function recordVarianceMovement(
  tx: TxClient,
  line: CompleteStocktakePayload['lines'][number],
  sessionId: string,
  entityId: string,
  completedAt: Date,
): Promise<void> {
  const bookQty = await getLatestStockQty(tx, line.inventoryItemId);
  const variance = line.countedQty - bookQty;
  if (variance === 0) return;

  await tx.insert(schema.stockMovements).values({
    id: generateId(),
    accountId: 'default',
    entityId,
    inventoryItemId: line.inventoryItemId,
    movementType: 'ADJUSTMENT' as MovementType,
    qty: variance,
    stockQtyAfter: bookQty + variance,
    referenceType: ReferenceType.Adjustment,
    referenceId: sessionId,
    notes: line.notes ?? null,
    occurredAt: completedAt,
    createdAt: completedAt,
  });
}

async function recordVarianceMovements(
  tx: TxClient,
  payload: CompleteStocktakePayload,
  completedAt: Date,
): Promise<void> {
  for (const line of payload.lines) {
    await recordVarianceMovement(tx, line, payload.sessionId, payload.entityId, completedAt);
  }
}

async function completeSession(db: DbClient, payload: CompleteStocktakePayload): Promise<void> {
  const completedAt = now();
  await db.transaction(async (tx) => {
    await assertSessionCompletable(tx, payload.sessionId);
    await replaceCountedLines(tx, payload.sessionId, payload.lines);
    await recordVarianceMovements(tx, payload, completedAt);
    await tx
      .update(schema.stockCountSessions)
      .set({ status: 'complete', completedAt })
      .where(eq(schema.stockCountSessions.id, payload.sessionId));
  });
}

async function saveDraftLines(
  db: DbClient,
  sessionId: string,
  lines: CompleteStocktakePayload['lines'],
): Promise<void> {
  await db.transaction(async (tx) => {
    await replaceCountedLines(tx, sessionId, lines);
  });
}

export function createStocktakeRepo(db: DbClient) {
  return {
    createSession: (label?: string) => createSession(db, label),
    getSessions: () => getSessions(db),
    getSessionById: (id: string) => getSessionById(db, id),
    completeSession: (payload: CompleteStocktakePayload) => completeSession(db, payload),
    saveDraftLines: (sessionId: string, lines: CompleteStocktakePayload['lines']) =>
      saveDraftLines(db, sessionId, lines),
  };
}

import { randomUUID } from 'crypto';
import { eq, desc, asc, gt, sql } from 'drizzle-orm';
import type {
  ICapturedInvoice,
  ICapturedInvoiceAuditEntry,
  ICapturedInvoiceLine,
  ICapturedInvoiceWithLines,
  IInvoiceLineWithDate,
  ISaveCapturedInvoicePayload,
  IUpdateCapturedInvoicePayload,
} from '@shared/types/contract';
import { getDb, schema } from '../../db';

function toInvoice(row: { id: string; invoiceNumber?: string | null; invoiceDate?: Date | null; createdAt: Date; updatedAt?: Date | null }): ICapturedInvoice {
  return { id: row.id, invoiceNumber: row.invoiceNumber ?? null, invoiceDate: row.invoiceDate ?? null, createdAt: row.createdAt, updatedAt: row.updatedAt ?? null };
}

function toLine(row: {
  id: string;
  invoiceId: string;
  itemId: string;
  itemNameSnapshot: string;
  unitOfMeasure: string | null;
  quantity: number;
  vatMode: string;
  vatRate: number;
  totalVatExclude: number;
}): ICapturedInvoiceLine {
  const vatMode = (row.vatMode === 'inclusive' || row.vatMode === 'exclusive' || row.vatMode === 'non-taxable')
    ? row.vatMode
    : 'exclusive';
  return {
    id: row.id,
    invoiceId: row.invoiceId,
    itemId: row.itemId,
    itemNameSnapshot: row.itemNameSnapshot,
    unitOfMeasure: row.unitOfMeasure ?? undefined,
    quantity: row.quantity,
    vatMode,
    vatRate: row.vatRate,
    totalVatExclude: row.totalVatExclude,
  };
}

function recalcItemCosts(db: ReturnType<typeof getDb>, itemIds: string[], now: Date): void {
  for (const itemId of itemIds) {
    const [agg] = db
      .select({
        weightedAvgCost: sql<number | null>`CASE WHEN SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END) > 0 THEN SUM(CASE WHEN type = 'IN' AND cost_at_time IS NOT NULL THEN quantity * cost_at_time ELSE 0 END) / SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END) ELSE NULL END`,
        totalStock: sql<number>`COALESCE(SUM(CASE WHEN type = 'IN' THEN quantity WHEN type = 'OUT' THEN -quantity ELSE 0 END), 0)`,
      })
      .from(schema.stockMovements)
      .where(eq(schema.stockMovements.itemId, itemId))
      .all();
    db.update(schema.inventoryItems)
      .set({ weightedAvgCost: agg?.weightedAvgCost ?? null, totalStock: agg?.totalStock ?? 0, updatedAt: now })
      .where(eq(schema.inventoryItems.id, itemId))
      .run();
  }
}

export async function saveInvoice(payload: ISaveCapturedInvoicePayload): Promise<void> {
  const db = getDb();
  const createdAt = new Date();
  let affectedItemIds: string[] = [];
  db.transaction((tx) => {
    tx.insert(schema.capturedInvoices).values({
      id: payload.id,
      invoiceNumber: payload.invoiceNumber ?? null,
      invoiceDate: payload.invoiceDate ?? null,
      createdAt,
    }).run();
    const validLines = payload.lines.filter(
      (l) => l.itemId && l.itemNameSnapshot && l.quantity >= 0 && l.totalVatExclude >= 0
    );
    if (validLines.length > 0) {
      tx.insert(schema.capturedInvoiceLines).values(
        validLines.map((l) => ({
          id: l.id,
          invoiceId: payload.id,
          itemId: l.itemId,
          itemNameSnapshot: l.itemNameSnapshot,
          unitOfMeasure: l.unitOfMeasure ?? null,
          quantity: l.quantity,
          vatMode: l.vatMode,
          vatRate: l.vatRate,
          totalVatExclude: l.totalVatExclude,
        }))
      ).run();

      const inMovements = validLines
        .filter((l) => l.quantity > 0)
        .map((l) => ({
          id: randomUUID(),
          itemId: l.itemId,
          itemNameSnapshot: l.itemNameSnapshot,
          type: 'IN' as const,
          quantity: l.quantity,
          source: 'invoice' as const,
          referenceId: payload.id,
          costAtTime: l.totalVatExclude / l.quantity,
          createdAt,
        }));
      if (inMovements.length > 0) {
        tx.insert(schema.stockMovements).values(inMovements).run();
        affectedItemIds = [...new Set(inMovements.map((m) => m.itemId))];
      }
    }
  });
  if (affectedItemIds.length > 0) recalcItemCosts(db, affectedItemIds, createdAt);
}

export async function getInvoices(): Promise<ICapturedInvoice[]> {
  const rows = await getDb()
    .select()
    .from(schema.capturedInvoices)
    .orderBy(desc(schema.capturedInvoices.createdAt));
  return rows.map((r) => toInvoice({ id: r.id, invoiceNumber: r.invoiceNumber, invoiceDate: r.invoiceDate, createdAt: r.createdAt, updatedAt: r.updatedAt }));
}

export async function getLinesForAnalysis(): Promise<IInvoiceLineWithDate[]> {
  const rows = await getDb()
    .select({
      id: schema.capturedInvoiceLines.id,
      invoiceId: schema.capturedInvoiceLines.invoiceId,
      itemId: schema.capturedInvoiceLines.itemId,
      itemNameSnapshot: schema.capturedInvoiceLines.itemNameSnapshot,
      unitOfMeasure: schema.capturedInvoiceLines.unitOfMeasure,
      quantity: schema.capturedInvoiceLines.quantity,
      vatMode: schema.capturedInvoiceLines.vatMode,
      vatRate: schema.capturedInvoiceLines.vatRate,
      totalVatExclude: schema.capturedInvoiceLines.totalVatExclude,
      createdAt: schema.capturedInvoices.createdAt,
      categoryType: schema.inventoryCategories.type,
      categoryName: schema.inventoryCategories.name,
    })
    .from(schema.capturedInvoiceLines)
    .innerJoin(
      schema.capturedInvoices,
      eq(schema.capturedInvoiceLines.invoiceId, schema.capturedInvoices.id)
    )
    .leftJoin(
      schema.inventoryItems,
      eq(schema.capturedInvoiceLines.itemId, schema.inventoryItems.id)
    )
    .leftJoin(
      schema.inventoryCategories,
      eq(schema.inventoryItems.categoryId, schema.inventoryCategories.id)
    )
    .orderBy(asc(schema.capturedInvoices.createdAt));

  return rows.map((r) => ({
    ...toLine(r),
    createdAt: r.createdAt,
    categoryType: r.categoryType ?? null,
    categoryName: r.categoryName ?? null,
  }));
}

export async function getInvoicesWithLines(): Promise<ICapturedInvoiceWithLines[]> {
  const db = getDb();
  const invoiceRows = await db
    .select()
    .from(schema.capturedInvoices)
    .orderBy(desc(schema.capturedInvoices.createdAt));

  if (invoiceRows.length === 0) return [];

  const lineRows = await db
    .select()
    .from(schema.capturedInvoiceLines);

  const linesByInvoice = new Map<string, typeof lineRows>();
  for (const line of lineRows) {
    if (!linesByInvoice.has(line.invoiceId)) linesByInvoice.set(line.invoiceId, []);
    linesByInvoice.get(line.invoiceId)!.push(line);
  }

  return invoiceRows.map((inv) => ({
    ...toInvoice(inv),
    lines: (linesByInvoice.get(inv.id) ?? []).map(toLine),
  }));
}

export async function getInvoiceById(id: string): Promise<ICapturedInvoiceWithLines | null> {
  const invoiceRows = await getDb()
    .select()
    .from(schema.capturedInvoices)
    .where(eq(schema.capturedInvoices.id, id))
    .limit(1);
  if (invoiceRows.length === 0) return null;
  const inv = invoiceRows[0];
  const lineRows = await getDb()
    .select()
    .from(schema.capturedInvoiceLines)
    .where(eq(schema.capturedInvoiceLines.invoiceId, id));
  return {
    ...toInvoice(inv),
    lines: lineRows.map(toLine),
  };
}

export async function updateInvoice(payload: IUpdateCapturedInvoicePayload): Promise<void> {
  const db = getDb();
  const editedAt = new Date();

  // Load current state to snapshot before overwriting
  const current = await getInvoiceById(payload.id);
  if (!current) throw new Error(`Invoice not found: ${payload.id}`);

  const validLines = payload.lines.filter(
    (l) => l.itemId && l.itemNameSnapshot && l.quantity >= 0 && l.totalVatExclude >= 0
  );

  // Collect all affected item IDs (old + new) for recalc
  const affectedItemIds = new Set<string>(current.lines.map((l) => l.itemId));

  db.transaction((tx) => {
    // Write audit snapshot (before state)
    tx.insert(schema.invoiceAuditLog).values({
      id: randomUUID(),
      invoiceId: payload.id,
      editedAt,
      note: payload.note ?? null,
      snapshot: JSON.stringify(current),
    }).run();

    tx.delete(schema.capturedInvoiceLines)
      .where(eq(schema.capturedInvoiceLines.invoiceId, payload.id))
      .run();

    tx.delete(schema.stockMovements)
      .where(eq(schema.stockMovements.referenceId, payload.id))
      .run();

    if (validLines.length > 0) {
      tx.insert(schema.capturedInvoiceLines).values(
        validLines.map((l) => ({
          id: l.id,
          invoiceId: payload.id,
          itemId: l.itemId,
          itemNameSnapshot: l.itemNameSnapshot,
          unitOfMeasure: l.unitOfMeasure ?? null,
          quantity: l.quantity,
          vatMode: l.vatMode,
          vatRate: l.vatRate,
          totalVatExclude: l.totalVatExclude,
        }))
      ).run();

      const inMovements = validLines
        .filter((l) => l.quantity > 0)
        .map((l) => ({
          id: randomUUID(),
          itemId: l.itemId,
          itemNameSnapshot: l.itemNameSnapshot,
          type: 'IN' as const,
          quantity: l.quantity,
          source: 'invoice' as const,
          referenceId: payload.id,
          costAtTime: l.totalVatExclude / l.quantity,
          createdAt: editedAt,
        }));
      if (inMovements.length > 0) {
        tx.insert(schema.stockMovements).values(inMovements).run();
        for (const m of inMovements) affectedItemIds.add(m.itemId);
      }
    }

    // Stamp updatedAt
    tx.update(schema.capturedInvoices)
      .set({ updatedAt: editedAt })
      .where(eq(schema.capturedInvoices.id, payload.id))
      .run();
  });

  if (affectedItemIds.size > 0) recalcItemCosts(db, [...affectedItemIds], editedAt);
}

export async function getLastUnitPrices(): Promise<Record<string, number>> {
  const rows = await getDb()
    .select({
      itemId: schema.capturedInvoiceLines.itemId,
      quantity: schema.capturedInvoiceLines.quantity,
      totalVatExclude: schema.capturedInvoiceLines.totalVatExclude,
    })
    .from(schema.capturedInvoiceLines)
    .innerJoin(
      schema.capturedInvoices,
      eq(schema.capturedInvoiceLines.invoiceId, schema.capturedInvoices.id)
    )
    .where(gt(schema.capturedInvoiceLines.quantity, 0))
    .orderBy(desc(schema.capturedInvoices.createdAt));

  const result: Record<string, number> = {};
  for (const row of rows) {
    if (!(row.itemId in result)) {
      result[row.itemId] = row.totalVatExclude / row.quantity;
    }
  }
  return result;
}

export async function getInvoiceAudit(invoiceId: string): Promise<ICapturedInvoiceAuditEntry[]> {
  const rows = await getDb()
    .select()
    .from(schema.invoiceAuditLog)
    .where(eq(schema.invoiceAuditLog.invoiceId, invoiceId))
    .orderBy(desc(schema.invoiceAuditLog.editedAt));

  return rows.map((r) => ({
    id: r.id,
    invoiceId: r.invoiceId,
    editedAt: r.editedAt,
    note: r.note,
    snapshot: JSON.parse(r.snapshot) as ICapturedInvoiceWithLines,
  }));
}

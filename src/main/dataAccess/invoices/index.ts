import { eq, desc, asc } from 'drizzle-orm';
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

function toInvoice(row: { id: string; createdAt: Date; updatedAt?: Date | null }): ICapturedInvoice {
  return { id: row.id, createdAt: row.createdAt, updatedAt: row.updatedAt ?? null };
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

export async function saveInvoice(payload: ISaveCapturedInvoicePayload): Promise<void> {
  const db = getDb();
  const createdAt = new Date();
  db.transaction((tx) => {
    tx.insert(schema.capturedInvoices).values({
      id: payload.id,
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
    }
  });
}

export async function getInvoices(): Promise<ICapturedInvoice[]> {
  const rows = await getDb()
    .select()
    .from(schema.capturedInvoices)
    .orderBy(desc(schema.capturedInvoices.createdAt));
  return rows.map((r) => toInvoice({ id: r.id, createdAt: r.createdAt, updatedAt: r.updatedAt }));
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
    ...toInvoice({ id: inv.id, createdAt: inv.createdAt, updatedAt: inv.updatedAt }),
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
    ...toInvoice({ id: inv.id, createdAt: inv.createdAt, updatedAt: inv.updatedAt }),
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

  db.transaction((tx) => {
    // Write audit snapshot (before state)
    tx.insert(schema.invoiceAuditLog).values({
      id: crypto.randomUUID(),
      invoiceId: payload.id,
      editedAt,
      note: payload.note ?? null,
      snapshot: JSON.stringify(current),
    }).run();

    // Replace lines
    tx.delete(schema.capturedInvoiceLines)
      .where(eq(schema.capturedInvoiceLines.invoiceId, payload.id))
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
    }

    // Stamp updatedAt
    tx.update(schema.capturedInvoices)
      .set({ updatedAt: editedAt })
      .where(eq(schema.capturedInvoices.id, payload.id))
      .run();
  });
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

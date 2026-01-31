import { eq, desc } from 'drizzle-orm';
import type {
  ICapturedInvoice,
  ICapturedInvoiceLine,
  ICapturedInvoiceWithLines,
  ISaveCapturedInvoicePayload,
} from '@shared/types/contract';
import { getDb, schema } from '../../db';

function toInvoice(row: { id: string; createdAt: Date }): ICapturedInvoice {
  return { id: row.id, createdAt: row.createdAt };
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
  return rows.map((r) => toInvoice({ id: r.id, createdAt: r.createdAt }));
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
    ...toInvoice({ id: inv.id, createdAt: inv.createdAt }),
    lines: lineRows.map(toLine),
  };
}

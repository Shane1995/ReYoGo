import { and, asc, desc, eq, gt, inArray, sql } from 'drizzle-orm';
import { MovementType, InvoiceStatus, ReferenceType, VatMode } from '@reyogo/types';
import type {
  IInvoice,
  IInvoiceWithLines,
  IInvoiceLine,
  IInvoiceLinePayload,
  IInvoiceAuditEntry,
  ISaveCapturedInvoicePayload,
  IUpdateCapturedInvoicePayload,
  IUpdateCapturedInvoiceMetadataPayload,
  IUpdatePostedInvoiceLinesPayload,
  InvoiceLineWithDate,
  ISaveCreditNotePayload,
} from '@reyogo/types';
import { replayWacForward } from '../../utils/wac/replayForward';
import type { ReplayMovementResult } from '../../utils/wac/replayForward/types';
import type { DbClient } from '../../client';
import * as schema from '../../schema';
import { calculateWAC } from '../../utils/wac';
import { now } from '../../utils/timestamps';
import { generateId } from '../../utils/ids';

type TxClient = Parameters<DbClient['transaction']>[0] extends (tx: infer T) => Promise<unknown>
  ? T
  : never;

function orNull<T>(value: T | null | undefined): T | null {
  if (value == null) return null;
  return value;
}

function orDefault<T>(value: T | null | undefined, fallback: T): T {
  if (value == null) return fallback;
  return value;
}

function toIInvoice(row: schema.InvoiceRow): IInvoice {
  return {
    id: row.id,
    entityId: row.entityId,
    supplierId: orNull(row.supplierId),
    sourceInvoiceId: orNull(row.sourceInvoiceId),
    invoiceNumber: row.invoiceNumber,
    invoiceDate: orNull(row.invoiceDate),
    status: orDefault(row.status, InvoiceStatus.Draft),
    vatMode: orDefault(row.vatMode, VatMode.Exclusive),
    vatRate: orDefault(row.vatRate, 15),
    createdAt: row.createdAt,
    updatedAt: orNull(row.updatedAt),
  };
}

function toIInvoiceLine(row: schema.InvoiceLineItemRow, itemName?: string | null): IInvoiceLine {
  return {
    id: row.id,
    invoiceId: row.invoiceId,
    itemId: row.inventoryItemId,
    itemNameSnapshot: row.itemNameSnapshot || itemName || '',
    unitOfMeasure: null,
    quantity: row.qty,
    isVatable: row.isVatable ?? true,
    totalVatExclude: row.totalCost,
  };
}

async function getLatestMovement(
  tx: TxClient,
  itemId: string,
): Promise<{ stockQtyAfter: number; weightedAvgCostAfter: number | null } | null> {
  const rows = await tx
    .select({
      stockQtyAfter: schema.stockMovements.stockQtyAfter,
      weightedAvgCostAfter: schema.stockMovements.weightedAvgCostAfter,
    })
    .from(schema.stockMovements)
    .where(eq(schema.stockMovements.inventoryItemId, itemId))
    .orderBy(desc(schema.stockMovements.occurredAt), desc(schema.stockMovements.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

type MovementLine = { itemId: string; quantity: number; totalVatExclude: number };
type PrevMovement = { stockQtyAfter: number; weightedAvgCostAfter: number | null } | null;

function unitCostOf(line: MovementLine): number {
  if (line.quantity <= 0) return 0;
  return line.totalVatExclude / line.quantity;
}

function prevStockQty(prev: PrevMovement): number {
  if (!prev) return 0;
  return prev.stockQtyAfter;
}

function prevWac(prev: PrevMovement): number | null {
  if (!prev) return null;
  return prev.weightedAvgCostAfter;
}

function positiveQuantityLines(lines: MovementLine[]): MovementLine[] {
  return lines.filter((l) => l.quantity > 0);
}

async function insertMovementsForLines(
  tx: TxClient,
  lines: MovementLine[],
  referenceId: string,
  occurredAt: Date,
  createdAt: Date,
  entityId: string,
): Promise<void> {
  for (const line of positiveQuantityLines(lines)) {
    const prev = await getLatestMovement(tx, line.itemId);
    const unitCost = unitCostOf(line);
    const newWac = calculateWAC(prevStockQty(prev), prevWac(prev), line.quantity, unitCost);
    const newQty = prevStockQty(prev) + line.quantity;
    await tx.insert(schema.stockMovements).values({
      id: generateId(),
      inventoryItemId: line.itemId,
      accountId: 'default',
      entityId,
      movementType: MovementType.In,
      qty: line.quantity,
      unitCostAtTime: unitCost,
      totalCost: line.totalVatExclude,
      weightedAvgCostAfter: newWac,
      stockQtyAfter: newQty,
      referenceType: ReferenceType.Invoice,
      referenceId,
      occurredAt,
      createdAt,
    });
  }
}

function inclVat(unitCost: number, isVatable: boolean, vatRate: number): number {
  return isVatable ? unitCost * (1 + vatRate / 100) : unitCost;
}

function isVatableOf(value: boolean | null | undefined): boolean {
  if (value === null || value === undefined) return true;
  return value;
}

function unitCostInclVatOf(
  unitCostInclVat: number | null,
  unitCost: number,
  isVatable: boolean,
  vatRate: number,
): number {
  if (unitCostInclVat != null) return unitCostInclVat;
  return inclVat(unitCost, isVatable, vatRate);
}

type LineValues = {
  id: string;
  invoiceId: string;
  inventoryItemId: string;
  itemNameSnapshot: string;
  qty: number;
  unitCost: number;
  unitCostInclVat: number;
  totalCost: number;
  isVatable: boolean;
};

function buildLineValues(
  lines: ISaveCapturedInvoicePayload['lines'],
  invoiceId: string,
  vatRate: number,
): LineValues[] {
  return lines.map((l) => {
    const uc = l.quantity > 0 ? l.totalVatExclude / l.quantity : 0;
    return {
      id: l.id,
      invoiceId,
      inventoryItemId: l.itemId,
      itemNameSnapshot: l.itemNameSnapshot ?? '',
      qty: l.quantity,
      unitCost: uc,
      unitCostInclVat: inclVat(uc, l.isVatable, vatRate),
      totalCost: l.totalVatExclude,
      isVatable: l.isVatable,
    };
  });
}

function computeTax(
  lines: ISaveCapturedInvoicePayload['lines'],
  vatRate: number,
): { totalExclTax: number; taxAmount: number } {
  const totalExclTax = lines.reduce((s, l) => s + l.totalVatExclude, 0);
  const taxAmount = lines.reduce(
    (s, l) => s + (l.isVatable ? l.totalVatExclude * (vatRate / 100) : 0),
    0,
  );
  return { totalExclTax, taxAmount };
}

async function getCreditNotedQtyByItem(
  client: DbClient | TxClient,
  sourceInvoiceId: string,
): Promise<Record<string, number>> {
  const rows = await client
    .select({
      inventoryItemId: schema.invoiceLineItems.inventoryItemId,
      qty: schema.invoiceLineItems.qty,
    })
    .from(schema.invoiceLineItems)
    .innerJoin(schema.invoices, eq(schema.invoiceLineItems.invoiceId, schema.invoices.id))
    .where(
      and(
        eq(schema.invoices.sourceInvoiceId, sourceInvoiceId),
        eq(schema.invoices.status, InvoiceStatus.CreditNote),
      ),
    );
  const result: Record<string, number> = {};
  for (const row of rows) {
    result[row.inventoryItemId] = (result[row.inventoryItemId] ?? 0) + row.qty;
  }
  return result;
}

function accumulateCreditedQty(
  rows: { sourceInvoiceId: string | null; inventoryItemId: string; qty: number }[],
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const row of rows) {
    if (!row.sourceInvoiceId) continue;
    const key = `${row.sourceInvoiceId}::${row.inventoryItemId}`;
    result[key] = (result[key] ?? 0) + row.qty;
  }
  return result;
}

async function getCreditNotedQtyByInvoiceItem(
  client: DbClient | TxClient,
  entityId?: string,
): Promise<Record<string, number>> {
  const conditions = [eq(schema.invoices.status, InvoiceStatus.CreditNote)];
  if (entityId) conditions.push(eq(schema.invoices.entityId, entityId));
  const rows = await client
    .select({
      sourceInvoiceId: schema.invoices.sourceInvoiceId,
      inventoryItemId: schema.invoiceLineItems.inventoryItemId,
      qty: schema.invoiceLineItems.qty,
    })
    .from(schema.invoiceLineItems)
    .innerJoin(schema.invoices, eq(schema.invoiceLineItems.invoiceId, schema.invoices.id))
    .where(and(...conditions));
  return accumulateCreditedQty(rows);
}

type ItemTotal = { qty: number; totalValue: number };

function itemTotalDateConditions(
  dateExpr: ReturnType<typeof sql>,
  fromDate?: string,
  toDate?: string,
) {
  const conditions = [];
  if (fromDate) {
    const cutoff = Math.floor(new Date(fromDate + 'T00:00:00').getTime() / 1000);
    conditions.push(sql`${dateExpr} >= ${cutoff}`);
  }
  if (toDate) {
    const cutoff = Math.floor(new Date(toDate + 'T23:59:59').getTime() / 1000);
    conditions.push(sql`${dateExpr} <= ${cutoff}`);
  }
  return conditions;
}

function accumulateItemTotals(
  rows: { inventoryItemId: string; qty: number; totalCost: number }[],
): Record<string, ItemTotal> {
  const result: Record<string, ItemTotal> = {};
  for (const row of rows) {
    const existing = result[row.inventoryItemId] ?? { qty: 0, totalValue: 0 };
    result[row.inventoryItemId] = {
      qty: existing.qty + row.qty,
      totalValue: existing.totalValue + row.totalCost,
    };
  }
  return result;
}

async function getItemTotals(
  db: DbClient,
  status: InvoiceStatus,
  fromDate?: string,
  toDate?: string,
  entityId?: string,
): Promise<Record<string, ItemTotal>> {
  const dateExpr = sql`COALESCE(${schema.invoices.invoiceDate}, ${schema.invoices.createdAt})`;
  const conditions = [
    eq(schema.invoices.status, status),
    ...(entityId ? [eq(schema.invoices.entityId, entityId)] : []),
    ...itemTotalDateConditions(dateExpr, fromDate, toDate),
  ];

  const rows = await db
    .select({
      inventoryItemId: schema.invoiceLineItems.inventoryItemId,
      qty: schema.invoiceLineItems.qty,
      totalCost: schema.invoiceLineItems.totalCost,
    })
    .from(schema.invoiceLineItems)
    .innerJoin(schema.invoices, eq(schema.invoiceLineItems.invoiceId, schema.invoices.id))
    .where(and(...conditions));

  return accumulateItemTotals(rows);
}

async function getPurchaseTotalsByItem(
  db: DbClient,
  fromDate?: string,
  toDate?: string,
  entityId?: string,
): Promise<Record<string, ItemTotal>> {
  return getItemTotals(db, InvoiceStatus.Posted, fromDate, toDate, entityId);
}

async function getCreditTotalsByItem(
  db: DbClient,
  fromDate?: string,
  toDate?: string,
  entityId?: string,
): Promise<Record<string, ItemTotal>> {
  return getItemTotals(db, InvoiceStatus.CreditNote, fromDate, toDate, entityId);
}

async function saveInvoice(db: DbClient, payload: ISaveCapturedInvoicePayload): Promise<void> {
  const createdAt = now();
  const { totalExclTax, taxAmount } = computeTax(payload.lines, payload.vatRate);

  await db.transaction(async (tx) => {
    await tx.insert(schema.invoices).values({
      id: payload.id,
      supplierId: payload.supplierId ?? null,
      accountId: 'default',
      entityId: payload.entityId,
      invoiceNumber: payload.invoiceNumber,
      invoiceDate: payload.invoiceDate ?? null,
      status: InvoiceStatus.Draft,
      vatMode: payload.vatMode,
      vatRate: payload.vatRate,
      totalExclTax,
      taxAmount,
      totalInclTax: totalExclTax + taxAmount,
      createdAt,
    });

    const validLines = payload.lines.filter((l) => l.itemId && l.quantity >= 0);
    if (validLines.length > 0) {
      await tx
        .insert(schema.invoiceLineItems)
        .values(buildLineValues(validLines, payload.id, payload.vatRate));
    }
  });
}

function resolveVatMode(payload: { vatMode?: VatMode }, current: IInvoice): VatMode {
  if (payload.vatMode != null) return payload.vatMode;
  return current.vatMode;
}

function resolveVatRate(payload: { vatRate?: number }, current: IInvoice): number {
  if (payload.vatRate != null) return payload.vatRate;
  return current.vatRate;
}

function isValidInvoiceLine(line: { itemId: string | null; quantity: number }): boolean {
  if (!line.itemId) return false;
  return line.quantity >= 0;
}

async function updateInvoice(db: DbClient, payload: IUpdateCapturedInvoicePayload): Promise<void> {
  const editedAt = now();
  const current = await getInvoiceById(db, payload.id);
  if (!current) throw new Error(`Invoice not found: ${payload.id}`);
  if (current.status === InvoiceStatus.Posted)
    throw new Error(`Invoice ${payload.id} is posted and cannot be edited`);

  const vatMode = resolveVatMode(payload, current);
  const vatRate = resolveVatRate(payload, current);

  const validLines = payload.lines.filter(isValidInvoiceLine);
  const { totalExclTax, taxAmount } = computeTax(validLines, vatRate);

  await db.transaction(async (tx) => {
    await tx.insert(schema.invoiceAuditLog).values({
      id: generateId(),
      invoiceId: payload.id,
      editedAt,
      note: payload.note ?? null,
      snapshot: JSON.stringify(current),
    });
    await tx
      .delete(schema.invoiceLineItems)
      .where(eq(schema.invoiceLineItems.invoiceId, payload.id));

    if (validLines.length > 0) {
      await tx
        .insert(schema.invoiceLineItems)
        .values(buildLineValues(validLines, payload.id, vatRate));
    }
    await tx
      .update(schema.invoices)
      .set({
        updatedAt: editedAt,
        vatMode,
        vatRate,
        totalExclTax,
        taxAmount,
        totalInclTax: totalExclTax + taxAmount,
      })
      .where(eq(schema.invoices.id, payload.id));
  });
}

function withDefault<T>(value: T | undefined, fallback: T): T {
  if (value !== undefined) return value;
  return fallback;
}

async function updateInvoiceMetadata(
  db: DbClient,
  payload: IUpdateCapturedInvoiceMetadataPayload,
): Promise<void> {
  const editedAt = now();
  const current = await getInvoiceById(db, payload.id);
  if (!current) throw new Error(`Invoice not found: ${payload.id}`);

  await db.transaction(async (tx) => {
    await tx.insert(schema.invoiceAuditLog).values({
      id: generateId(),
      invoiceId: payload.id,
      editedAt,
      note: payload.note ?? null,
      snapshot: JSON.stringify(current),
    });
    await tx
      .update(schema.invoices)
      .set({
        supplierId: withDefault(payload.supplierId, current.supplierId),
        invoiceNumber: withDefault(payload.invoiceNumber, current.invoiceNumber),
        invoiceDate: withDefault(payload.invoiceDate, current.invoiceDate),
        updatedAt: editedAt,
      })
      .where(eq(schema.invoices.id, payload.id));
  });
}

async function getInvoices(db: DbClient): Promise<IInvoice[]> {
  const rows = await db.select().from(schema.invoices).orderBy(desc(schema.invoices.createdAt));
  return rows.map(toIInvoice);
}

async function getInvoicesWithLines(db: DbClient): Promise<IInvoiceWithLines[]> {
  const invoiceRows = await db
    .select()
    .from(schema.invoices)
    .orderBy(desc(schema.invoices.createdAt));
  if (invoiceRows.length === 0) return [];

  const lineRows = await db
    .select({
      line: schema.invoiceLineItems,
      itemName: schema.inventoryItems.name,
      uomName: schema.unitsOfMeasure.name,
    })
    .from(schema.invoiceLineItems)
    .leftJoin(
      schema.inventoryItems,
      eq(schema.invoiceLineItems.inventoryItemId, schema.inventoryItems.id),
    )
    .leftJoin(
      schema.unitsOfMeasure,
      eq(schema.inventoryItems.unitOfMeasureId, schema.unitsOfMeasure.id),
    );

  const linesByInvoice = new Map<string, typeof lineRows>();
  for (const row of lineRows) {
    if (!linesByInvoice.has(row.line.invoiceId)) linesByInvoice.set(row.line.invoiceId, []);
    linesByInvoice.get(row.line.invoiceId)!.push(row);
  }

  return invoiceRows.map((inv) => ({
    ...toIInvoice(inv),
    lines: (linesByInvoice.get(inv.id) ?? []).map((r) => ({
      ...toIInvoiceLine(r.line, r.itemName),
      unitOfMeasure: r.uomName ?? null,
    })),
  }));
}

async function getInvoiceById(db: DbClient, id: string): Promise<IInvoiceWithLines | null> {
  const invRows = await db
    .select()
    .from(schema.invoices)
    .where(eq(schema.invoices.id, id))
    .limit(1);
  if (!invRows[0]) return null;

  const lineRows = await db
    .select({
      line: schema.invoiceLineItems,
      itemName: schema.inventoryItems.name,
      uomName: schema.unitsOfMeasure.name,
    })
    .from(schema.invoiceLineItems)
    .leftJoin(
      schema.inventoryItems,
      eq(schema.invoiceLineItems.inventoryItemId, schema.inventoryItems.id),
    )
    .leftJoin(
      schema.unitsOfMeasure,
      eq(schema.inventoryItems.unitOfMeasureId, schema.unitsOfMeasure.id),
    )
    .where(eq(schema.invoiceLineItems.invoiceId, id));

  return {
    ...toIInvoice(invRows[0]),
    lines: lineRows.map((r) => ({
      ...toIInvoiceLine(r.line, r.itemName),
      unitOfMeasure: r.uomName ?? null,
    })),
  };
}

async function getLinesForAnalysis(
  db: DbClient,
  entityId?: string,
): Promise<InvoiceLineWithDate[]> {
  const effectiveDate = sql<Date>`COALESCE(${schema.invoices.invoiceDate}, ${schema.invoices.createdAt})`;
  const rows = await db
    .select({
      id: schema.invoiceLineItems.id,
      invoiceId: schema.invoiceLineItems.invoiceId,
      inventoryItemId: schema.invoiceLineItems.inventoryItemId,
      qty: schema.invoiceLineItems.qty,
      unitCost: schema.invoiceLineItems.unitCost,
      unitCostInclVat: schema.invoiceLineItems.unitCostInclVat,
      totalCost: schema.invoiceLineItems.totalCost,
      invoiceDate: effectiveDate,
      categoryType: schema.inventoryCategories.type,
      categoryName: schema.inventoryCategories.name,
      vatRate: schema.invoices.vatRate,
      isVatable: schema.invoiceLineItems.isVatable,
    })
    .from(schema.invoiceLineItems)
    .innerJoin(schema.invoices, eq(schema.invoiceLineItems.invoiceId, schema.invoices.id))
    .leftJoin(
      schema.inventoryItems,
      eq(schema.invoiceLineItems.inventoryItemId, schema.inventoryItems.id),
    )
    .leftJoin(
      schema.inventoryCategories,
      eq(schema.inventoryItems.categoryId, schema.inventoryCategories.id),
    )
    .where(
      entityId
        ? and(
            eq(schema.invoices.entityId, entityId),
            eq(schema.invoices.status, InvoiceStatus.Posted),
          )
        : eq(schema.invoices.status, InvoiceStatus.Posted),
    )
    .orderBy(asc(effectiveDate));
  return rows.map((r) => {
    const isVatable = isVatableOf(r.isVatable);
    return {
      id: r.id,
      invoiceId: r.invoiceId,
      inventoryItemId: r.inventoryItemId,
      qty: r.qty,
      unitCost: r.unitCost,
      totalCost: r.totalCost,
      invoiceDate: new Date(Number(r.invoiceDate) * 1000),
      categoryType: orNull(r.categoryType),
      categoryName: orNull(r.categoryName),
      vatRate: r.vatRate!,
      isVatable,
      unitCostInclVat: unitCostInclVatOf(r.unitCostInclVat, r.unitCost, isVatable, r.vatRate!),
    };
  });
}

async function getLastUnitPrices(
  db: DbClient,
  asOfDate?: string,
): Promise<Record<string, { exclVat: number; inclVat: number }>> {
  const conditions = [
    gt(schema.invoiceLineItems.qty, 0),
    eq(schema.invoices.status, InvoiceStatus.Posted),
  ];
  if (asOfDate) {
    const cutoffSeconds = Math.floor(new Date(asOfDate + 'T23:59:59').getTime() / 1000);
    conditions.push(
      sql`COALESCE(${schema.invoices.invoiceDate}, ${schema.invoices.createdAt}) <= ${cutoffSeconds}`,
    );
  }
  const rows = await db
    .select({
      inventoryItemId: schema.invoiceLineItems.inventoryItemId,
      unitCost: schema.invoiceLineItems.unitCost,
      unitCostInclVat: schema.invoiceLineItems.unitCostInclVat,
      vatRate: schema.invoices.vatRate,
      isVatable: schema.invoiceLineItems.isVatable,
    })
    .from(schema.invoiceLineItems)
    .innerJoin(schema.invoices, eq(schema.invoiceLineItems.invoiceId, schema.invoices.id))
    .where(and(...conditions))
    .orderBy(desc(sql`COALESCE(${schema.invoices.invoiceDate}, ${schema.invoices.createdAt})`));
  const result: Record<string, { exclVat: number; inclVat: number }> = {};
  for (const row of rows) {
    if (row.inventoryItemId in result) continue;
    const exclVat = row.unitCost;
    result[row.inventoryItemId] = {
      exclVat,
      inclVat: unitCostInclVatOf(
        row.unitCostInclVat,
        exclVat,
        isVatableOf(row.isVatable),
        row.vatRate!,
      ),
    };
  }
  return result;
}

async function getInvoiceAudit(db: DbClient, invoiceId: string): Promise<IInvoiceAuditEntry[]> {
  const rows = await db
    .select()
    .from(schema.invoiceAuditLog)
    .where(eq(schema.invoiceAuditLog.invoiceId, invoiceId))
    .orderBy(desc(schema.invoiceAuditLog.editedAt));
  return rows.map((r) => {
    const snapshot: IInvoiceWithLines = JSON.parse(r.snapshot);
    return {
      id: r.id,
      invoiceId: r.invoiceId,
      editedAt: r.editedAt,
      note: r.note ?? null,
      snapshot,
    };
  });
}

async function saveAndPostInvoice(
  db: DbClient,
  payload: ISaveCapturedInvoicePayload,
): Promise<void> {
  const createdAt = now();
  const occurredAt = payload.invoiceDate ?? createdAt;
  const { totalExclTax, taxAmount } = computeTax(payload.lines, payload.vatRate);
  const validLines = payload.lines.filter((l) => l.itemId && l.quantity >= 0);

  await db.transaction(async (tx) => {
    await tx.insert(schema.invoices).values({
      id: payload.id,
      supplierId: payload.supplierId ?? null,
      accountId: 'default',
      entityId: payload.entityId,
      invoiceNumber: payload.invoiceNumber,
      invoiceDate: payload.invoiceDate ?? null,
      status: InvoiceStatus.Posted,
      vatMode: payload.vatMode,
      vatRate: payload.vatRate,
      totalExclTax,
      taxAmount,
      totalInclTax: totalExclTax + taxAmount,
      createdAt,
    });

    if (validLines.length > 0) {
      await tx
        .insert(schema.invoiceLineItems)
        .values(buildLineValues(validLines, payload.id, payload.vatRate));
    }

    await insertMovementsForLines(
      tx,
      validLines,
      payload.id,
      occurredAt,
      createdAt,
      payload.entityId,
    );
  });
}

async function postInvoice(db: DbClient, id: string): Promise<void> {
  const invoice = await getInvoiceById(db, id);
  if (!invoice) throw new Error(`Invoice not found: ${id}`);
  if (invoice.status === InvoiceStatus.Posted) throw new Error(`Invoice ${id} is already posted`);

  const postedAt = now();
  const occurredAt = invoice.invoiceDate ?? postedAt;

  await db.transaction(async (tx) => {
    await insertMovementsForLines(tx, invoice.lines, id, occurredAt, postedAt, invoice.entityId);
    await tx
      .update(schema.invoices)
      .set({ status: InvoiceStatus.Posted, updatedAt: postedAt })
      .where(eq(schema.invoices.id, id));
  });
}

function sourceQtyFor(sourceLines: schema.InvoiceLineItemRow[], itemId: string): number {
  const found = sourceLines.find((l) => l.inventoryItemId === itemId);
  if (!found) return 0;
  return found.qty;
}

function creditedQtyFor(alreadyCredited: Record<string, number>, itemId: string): number {
  const value = alreadyCredited[itemId];
  if (value === undefined) return 0;
  return value;
}

async function validateCreditNoteLines(
  validLines: ISaveCreditNotePayload['lines'],
  sourceLines: schema.InvoiceLineItemRow[],
  alreadyCredited: Record<string, number>,
): Promise<void> {
  for (const line of validLines) {
    const sourceQty = sourceQtyFor(sourceLines, line.itemId);
    const credited = creditedQtyFor(alreadyCredited, line.itemId);
    if (credited + line.quantity > sourceQty) {
      throw new Error(
        `Credited quantity exceeds original invoice quantity for item ${line.itemId}`,
      );
    }
  }
}

type CreditLine = ISaveCreditNotePayload['lines'][number] & { totalVatExclude: number };

async function insertCreditNoteMovements(
  tx: TxClient,
  payload: ISaveCreditNotePayload,
  creditLines: CreditLine[],
  createdAt: ReturnType<typeof now>,
): Promise<void> {
  for (const line of creditLines) {
    const prev = await getLatestMovement(tx, line.itemId);
    const newQty = prevStockQty(prev) - line.quantity;
    await tx.insert(schema.stockMovements).values({
      id: generateId(),
      inventoryItemId: line.itemId,
      accountId: 'default',
      entityId: payload.entityId,
      movementType: MovementType.Return,
      qty: -line.quantity,
      unitCostAtTime: line.unitPrice,
      totalCost: -line.totalVatExclude,
      weightedAvgCostAfter: prevWac(prev),
      stockQtyAfter: newQty,
      referenceType: ReferenceType.CreditNote,
      referenceId: payload.id,
      occurredAt: createdAt,
      createdAt,
    });
  }
}

function buildCreditLines(payload: ISaveCreditNotePayload): CreditLine[] {
  return payload.lines
    .filter((l) => l.itemId && l.quantity > 0)
    .map((l) => ({ ...l, totalVatExclude: l.unitPrice * l.quantity }));
}

async function fetchAndValidateSourceInvoice(
  tx: TxClient,
  payload: ISaveCreditNotePayload,
  validLines: ISaveCreditNotePayload['lines'],
): Promise<void> {
  const sourceInvoice = await tx
    .select()
    .from(schema.invoices)
    .where(eq(schema.invoices.id, payload.sourceInvoiceId))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!sourceInvoice) throw new Error(`Source invoice not found: ${payload.sourceInvoiceId}`);
  if (sourceInvoice.status !== InvoiceStatus.Posted)
    throw new Error(`Credit notes can only be raised against posted invoices`);

  const sourceLines = await tx
    .select()
    .from(schema.invoiceLineItems)
    .where(eq(schema.invoiceLineItems.invoiceId, payload.sourceInvoiceId));

  const alreadyCredited = await getCreditNotedQtyByItem(tx, payload.sourceInvoiceId);
  await validateCreditNoteLines(validLines, sourceLines, alreadyCredited);
}

async function insertCreditNoteLineItems(
  tx: TxClient,
  payload: ISaveCreditNotePayload,
  creditLines: CreditLine[],
): Promise<void> {
  if (creditLines.length === 0) return;
  await tx.insert(schema.invoiceLineItems).values(
    creditLines.map((l) => ({
      id: l.id,
      invoiceId: payload.id,
      inventoryItemId: l.itemId,
      itemNameSnapshot: l.itemNameSnapshot ?? '',
      qty: l.quantity,
      unitCost: l.unitPrice,
      unitCostInclVat: inclVat(l.unitPrice, l.isVatable, payload.vatRate),
      totalCost: l.totalVatExclude,
      isVatable: l.isVatable,
    })),
  );
}

async function saveCreditNote(db: DbClient, payload: ISaveCreditNotePayload): Promise<void> {
  const createdAt = now();
  const creditLines = buildCreditLines(payload);
  const validLines = payload.lines.filter((l) => l.itemId && l.quantity > 0);

  await db.transaction(async (tx) => {
    await fetchAndValidateSourceInvoice(tx, payload, validLines);

    const { totalExclTax, taxAmount } = computeTax(creditLines, payload.vatRate);

    await tx.insert(schema.invoices).values({
      id: payload.id,
      sourceInvoiceId: payload.sourceInvoiceId,
      supplierId: payload.supplierId ?? null,
      accountId: 'default',
      entityId: payload.entityId,
      invoiceNumber: payload.invoiceNumber,
      invoiceDate: null,
      status: InvoiceStatus.CreditNote,
      vatMode: payload.vatMode,
      vatRate: payload.vatRate,
      totalExclTax,
      taxAmount,
      totalInclTax: totalExclTax + taxAmount,
      createdAt,
    });

    await insertCreditNoteLineItems(tx, payload, creditLines);
    await insertCreditNoteMovements(tx, payload, creditLines, createdAt);

    await tx.insert(schema.invoiceAuditLog).values({
      id: generateId(),
      invoiceId: payload.sourceInvoiceId,
      editedAt: createdAt,
      note: payload.note ?? `Credit note ${payload.invoiceNumber} raised`,
      snapshot: JSON.stringify({ creditNoteId: payload.id }),
    });
  });
}

async function getCreditNotesForInvoice(
  db: DbClient,
  sourceInvoiceId: string,
): Promise<IInvoiceWithLines[]> {
  const invoiceRows = await db
    .select()
    .from(schema.invoices)
    .where(eq(schema.invoices.sourceInvoiceId, sourceInvoiceId))
    .orderBy(desc(schema.invoices.createdAt));
  if (invoiceRows.length === 0) return [];

  const lineRows = await db
    .select({
      line: schema.invoiceLineItems,
      itemName: schema.inventoryItems.name,
      uomName: schema.unitsOfMeasure.name,
    })
    .from(schema.invoiceLineItems)
    .leftJoin(
      schema.inventoryItems,
      eq(schema.invoiceLineItems.inventoryItemId, schema.inventoryItems.id),
    )
    .leftJoin(
      schema.unitsOfMeasure,
      eq(schema.inventoryItems.unitOfMeasureId, schema.unitsOfMeasure.id),
    )
    .where(
      inArray(
        schema.invoiceLineItems.invoiceId,
        invoiceRows.map((r) => r.id),
      ),
    );

  const linesByInvoice = new Map<string, typeof lineRows>();
  for (const row of lineRows) {
    if (!linesByInvoice.has(row.line.invoiceId)) linesByInvoice.set(row.line.invoiceId, []);
    linesByInvoice.get(row.line.invoiceId)!.push(row);
  }

  return invoiceRows.map((inv) => ({
    ...toIInvoice(inv),
    lines: (linesByInvoice.get(inv.id) ?? []).map((r) => ({
      ...toIInvoiceLine(r.line, r.itemName),
      unitOfMeasure: r.uomName ?? null,
    })),
  }));
}

type ReplayableMovement = {
  id: string;
  movementType: MovementType;
  qty: number;
  unitCostAtTime: number | null;
  occurredAt: Date;
  createdAt: Date;
};

function toReplayable(row: schema.StockMovementRow): ReplayableMovement {
  return {
    id: row.id,
    movementType: row.movementType,
    qty: row.qty,
    unitCostAtTime: row.unitCostAtTime,
    occurredAt: row.occurredAt,
    createdAt: row.createdAt,
  };
}

// 3-tier chronological tiebreak (occurredAt, createdAt, id); each tier is required for deterministic ordering.
// fallow-ignore-next-line complexity
function sortMovements(a: ReplayableMovement, b: ReplayableMovement): number {
  const occurredDiff = a.occurredAt.getTime() - b.occurredAt.getTime();
  if (occurredDiff !== 0) return occurredDiff;
  const createdDiff = a.createdAt.getTime() - b.createdAt.getTime();
  if (createdDiff !== 0) return createdDiff;
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
}

const NEGATIVE_STOCK_EPSILON = 1e-6;

function hasPositiveQuantity(
  newLine: IInvoiceLinePayload | undefined,
): newLine is IInvoiceLinePayload {
  return newLine !== undefined && newLine.quantity > 0;
}

function buildCandidateMovement(
  anchorRow: schema.StockMovementRow | undefined,
  newLine: IInvoiceLinePayload | undefined,
  newOccurredAt: Date,
  editedAt: Date,
): ReplayableMovement | null {
  if (!hasPositiveQuantity(newLine)) return null;
  const id = anchorRow ? anchorRow.id : generateId();
  const createdAt = anchorRow ? anchorRow.createdAt : editedAt;
  return {
    id,
    movementType: MovementType.In,
    qty: newLine.quantity,
    unitCostAtTime: newLine.totalVatExclude / newLine.quantity,
    occurredAt: newOccurredAt,
    createdAt,
  };
}

function assertNoNegativeStock(results: ReplayMovementResult[], itemId: string): void {
  const negative = results.some((r) => r.stockQtyAfter < -NEGATIVE_STOCK_EPSILON);
  if (!negative) return;
  throw new Error(
    `Editing this line would make stock for item ${itemId} negative — a later credit note or adjustment conflicts with this change`,
  );
}

async function writeUpdatedMovements(
  tx: TxClient,
  otherRows: schema.StockMovementRow[],
  resultById: Map<string, ReplayMovementResult>,
): Promise<void> {
  for (const row of otherRows) {
    const result = resultById.get(row.id)!;
    const unchanged =
      row.stockQtyAfter === result.stockQtyAfter &&
      row.weightedAvgCostAfter === result.weightedAvgCostAfter;
    if (unchanged) continue;
    await tx
      .update(schema.stockMovements)
      .set({
        stockQtyAfter: result.stockQtyAfter,
        weightedAvgCostAfter: result.weightedAvgCostAfter,
      })
      .where(eq(schema.stockMovements.id, row.id));
  }
}

async function writeCandidateMovement(
  tx: TxClient,
  candidate: ReplayableMovement,
  anchorRow: schema.StockMovementRow | undefined,
  result: ReplayMovementResult,
  invoiceId: string,
  itemId: string,
  entityId: string,
): Promise<void> {
  const totalCost = candidate.qty * (candidate.unitCostAtTime ?? 0);
  if (anchorRow) {
    await tx
      .update(schema.stockMovements)
      .set({
        qty: candidate.qty,
        unitCostAtTime: candidate.unitCostAtTime,
        totalCost,
        occurredAt: candidate.occurredAt,
        stockQtyAfter: result.stockQtyAfter,
        weightedAvgCostAfter: result.weightedAvgCostAfter,
      })
      .where(eq(schema.stockMovements.id, anchorRow.id));
    return;
  }
  await tx.insert(schema.stockMovements).values({
    id: candidate.id,
    accountId: 'default',
    entityId,
    inventoryItemId: itemId,
    movementType: MovementType.In,
    qty: candidate.qty,
    unitCostAtTime: candidate.unitCostAtTime,
    totalCost,
    weightedAvgCostAfter: result.weightedAvgCostAfter,
    stockQtyAfter: result.stockQtyAfter,
    referenceType: ReferenceType.Invoice,
    referenceId: invoiceId,
    occurredAt: candidate.occurredAt,
    createdAt: candidate.createdAt,
  });
}

async function replayItemMovements(
  tx: TxClient,
  invoiceId: string,
  itemId: string,
  newLine: IInvoiceLinePayload | undefined,
  newOccurredAt: Date,
  editedAt: Date,
  entityId: string,
): Promise<void> {
  const rows = await tx
    .select()
    .from(schema.stockMovements)
    .where(eq(schema.stockMovements.inventoryItemId, itemId));

  const anchorRow = rows.find(
    (m) => m.referenceType === ReferenceType.Invoice && m.referenceId === invoiceId,
  );
  const otherRows = rows.filter((r) => r.id !== anchorRow?.id);
  const others = otherRows.map(toReplayable);
  const candidate = buildCandidateMovement(anchorRow, newLine, newOccurredAt, editedAt);
  const merged = (candidate ? [...others, candidate] : others).sort(sortMovements);
  const results = replayWacForward(0, null, merged);
  assertNoNegativeStock(results, itemId);

  const resultById = new Map(results.map((r) => [r.id, r]));
  await writeUpdatedMovements(tx, otherRows, resultById);

  if (candidate) {
    await writeCandidateMovement(
      tx,
      candidate,
      anchorRow,
      resultById.get(candidate.id)!,
      invoiceId,
      itemId,
      entityId,
    );
  } else if (anchorRow) {
    await tx.delete(schema.stockMovements).where(eq(schema.stockMovements.id, anchorRow.id));
  }
}

function creditedQtyOf(itemId: string, creditedByItem: Record<string, number>): number {
  return creditedByItem[itemId] ?? 0;
}

function newQtyOf(itemId: string, newQtyByItem: Map<string, number>): number {
  return newQtyByItem.get(itemId) ?? 0;
}

function assertNoCreditGuardViolation(
  currentLines: IInvoiceLine[],
  newQtyByItem: Map<string, number>,
  creditedByItem: Record<string, number>,
): void {
  for (const line of currentLines) {
    const credited = creditedQtyOf(line.itemId, creditedByItem);
    const newQty = newQtyOf(line.itemId, newQtyByItem);
    if (credited > 0 && newQty < credited) {
      throw new Error(
        `Item ${line.itemId} has ${credited} units already credited via credit note; cannot reduce invoiced qty below ${credited} — use a credit note instead`,
      );
    }
  }
}

async function replayAllAffectedItems(
  tx: TxClient,
  invoiceId: string,
  currentLines: IInvoiceLine[],
  validLines: IInvoiceLinePayload[],
  newOccurredAt: Date,
  editedAt: Date,
  entityId: string,
): Promise<void> {
  const affectedItemIds = new Set([
    ...currentLines.map((l) => l.itemId),
    ...validLines.map((l) => l.itemId),
  ]);
  for (const itemId of affectedItemIds) {
    const newLine = validLines.find((l) => l.itemId === itemId);
    await replayItemMovements(tx, invoiceId, itemId, newLine, newOccurredAt, editedAt, entityId);
  }
}

async function updatePostedInvoiceLines(
  db: DbClient,
  payload: IUpdatePostedInvoiceLinesPayload,
): Promise<void> {
  const editedAt = now();
  const current = await getInvoiceById(db, payload.id);
  if (!current) throw new Error(`Invoice not found: ${payload.id}`);
  if (current.status !== InvoiceStatus.Posted)
    throw new Error(`Invoice ${payload.id} is not posted`);

  const vatMode = resolveVatMode(payload, current);
  const vatRate = resolveVatRate(payload, current);
  const validLines = payload.lines.filter(isValidInvoiceLine);
  const { totalExclTax, taxAmount } = computeTax(validLines, vatRate);
  const newInvoiceDate = withDefault(payload.invoiceDate, current.invoiceDate);
  const newOccurredAt = newInvoiceDate ?? current.createdAt;

  await db.transaction(async (tx) => {
    await tx.insert(schema.invoiceAuditLog).values({
      id: generateId(),
      invoiceId: payload.id,
      editedAt,
      note: payload.note ?? null,
      snapshot: JSON.stringify(current),
    });

    const creditedByItem = await getCreditNotedQtyByItem(tx, payload.id);
    const newQtyByItem = new Map(validLines.map((l) => [l.itemId, l.quantity]));
    assertNoCreditGuardViolation(current.lines, newQtyByItem, creditedByItem);

    await tx
      .delete(schema.invoiceLineItems)
      .where(eq(schema.invoiceLineItems.invoiceId, payload.id));
    if (validLines.length > 0) {
      await tx
        .insert(schema.invoiceLineItems)
        .values(buildLineValues(validLines, payload.id, vatRate));
    }
    await tx
      .update(schema.invoices)
      .set({
        updatedAt: editedAt,
        vatMode,
        vatRate,
        invoiceDate: newInvoiceDate,
        totalExclTax,
        taxAmount,
        totalInclTax: totalExclTax + taxAmount,
      })
      .where(eq(schema.invoices.id, payload.id));

    await replayAllAffectedItems(
      tx,
      payload.id,
      current.lines,
      validLines,
      newOccurredAt,
      editedAt,
      current.entityId,
    );
  });
}

export function createInvoicesRepo(db: DbClient) {
  return {
    saveInvoice: (payload: ISaveCapturedInvoicePayload) => saveInvoice(db, payload),
    updateInvoice: (payload: IUpdateCapturedInvoicePayload) => updateInvoice(db, payload),
    updateInvoiceMetadata: (payload: IUpdateCapturedInvoiceMetadataPayload) =>
      updateInvoiceMetadata(db, payload),
    getInvoices: () => getInvoices(db),
    getInvoicesWithLines: () => getInvoicesWithLines(db),
    getInvoiceById: (id: string) => getInvoiceById(db, id),
    getLinesForAnalysis: (entityId?: string) => getLinesForAnalysis(db, entityId),
    getLastUnitPrices: (asOfDate?: string) => getLastUnitPrices(db, asOfDate),
    getInvoiceAudit: (id: string) => getInvoiceAudit(db, id),
    saveAndPostInvoice: (payload: ISaveCapturedInvoicePayload) => saveAndPostInvoice(db, payload),
    postInvoice: (id: string) => postInvoice(db, id),
    saveCreditNote: (payload: ISaveCreditNotePayload) => saveCreditNote(db, payload),
    getCreditNotesForInvoice: (sourceInvoiceId: string) =>
      getCreditNotesForInvoice(db, sourceInvoiceId),
    getCreditNotedQtyByInvoiceItem: (entityId?: string) =>
      getCreditNotedQtyByInvoiceItem(db, entityId),
    getPurchaseTotalsByItem: (fromDate?: string, toDate?: string, entityId?: string) =>
      getPurchaseTotalsByItem(db, fromDate, toDate, entityId),
    getCreditTotalsByItem: (fromDate?: string, toDate?: string, entityId?: string) =>
      getCreditTotalsByItem(db, fromDate, toDate, entityId),
    updatePostedInvoiceLines: (payload: IUpdatePostedInvoiceLinesPayload) =>
      updatePostedInvoiceLines(db, payload),
  };
}

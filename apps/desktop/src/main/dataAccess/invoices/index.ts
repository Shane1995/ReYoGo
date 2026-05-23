import { randomUUID } from 'crypto';
import { eq, desc, asc, gt, and } from 'drizzle-orm';
import type {
  IInvoice,
  IInvoiceWithLines,
  IInvoiceLine,
  IInvoiceLineWithDate,
  IInvoiceAuditEntry,
  ISaveInvoicePayload,
  IUpdateInvoicePayload,
} from '@reyogo/types';
import { getDb, schema } from '../../db';

// The transaction callback's first argument type
type TxDb = Parameters<ReturnType<typeof getDb>['transaction']>[0] extends (tx: infer T) => unknown
  ? T
  : never;

// ---------------------------------------------------------------------------
// Mapper helpers
// ---------------------------------------------------------------------------

function toInvoice(row: {
  id: string;
  supplierId?: string | null;
  invoiceNumber?: string | null;
  invoiceDate?: Date | null;
  createdAt: Date;
  updatedAt?: Date | null;
}): IInvoice {
  return {
    id: row.id,
    supplierId: row.supplierId ?? null,
    invoiceNumber: row.invoiceNumber ?? null,
    invoiceDate: row.invoiceDate ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? null,
  };
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
}): IInvoiceLine {
  const vatMode =
    row.vatMode === 'inclusive' || row.vatMode === 'exclusive' || row.vatMode === 'non-taxable'
      ? row.vatMode
      : 'exclusive';
  return {
    id: row.id,
    invoiceId: row.invoiceId,
    itemId: row.itemId,
    itemNameSnapshot: row.itemNameSnapshot,
    unitOfMeasure: row.unitOfMeasure ?? null,
    quantity: row.quantity,
    vatMode,
    vatRate: row.vatRate,
    totalVatExclude: row.totalVatExclude,
  };
}

// ---------------------------------------------------------------------------
// WAC helpers (module-private)
// ---------------------------------------------------------------------------

function getLatestMovement(
  tx: TxDb,
  itemId: string,
): { stockQtyAfter: number; weightedAvgCostAfter: number | null } | null {
  const row = tx
    .select({
      stockQtyAfter: schema.stockMovements.stockQtyAfter,
      weightedAvgCostAfter: schema.stockMovements.weightedAvgCostAfter,
    })
    .from(schema.stockMovements)
    .where(eq(schema.stockMovements.inventoryItemId, itemId))
    .orderBy(
      desc(schema.stockMovements.occurredAt),
      desc(schema.stockMovements.createdAt),
    )
    .limit(1)
    .get();
  return row ?? null;
}

function round4(x: number): number {
  return Math.round(x * 10000) / 10000;
}

function computeWac(
  prevQty: number,
  prevWac: number | null,
  inQty: number,
  unitCost: number,
): { newWac: number; newQtyAfter: number } {
  if (prevQty === 0 || prevWac === null) {
    return { newWac: unitCost, newQtyAfter: inQty };
  }
  const newWac = round4((prevQty * prevWac + inQty * unitCost) / (prevQty + inQty));
  const newQtyAfter = prevQty + inQty;
  return { newWac, newQtyAfter };
}

// ---------------------------------------------------------------------------
// Insert movements for a set of valid lines (shared between save and update)
// ---------------------------------------------------------------------------

function insertMovementsForLines(
  tx: TxDb,
  lines: ISaveInvoicePayload['lines'],
  referenceId: string,
  occurredAt: Date,
  createdAt: Date,
): void {
  const inLines = lines.filter((l) => l.quantity > 0);
  for (const l of inLines) {
    const unitCostAtTime = l.totalVatExclude / l.quantity;
    const totalCost = l.quantity * unitCostAtTime;

    const prev = getLatestMovement(tx, l.itemId);
    const prevQty = prev?.stockQtyAfter ?? 0;
    const prevWac = prev?.weightedAvgCostAfter ?? null;

    const { newWac, newQtyAfter } = computeWac(prevQty, prevWac, l.quantity, unitCostAtTime);

    tx.insert(schema.stockMovements)
      .values({
        id: randomUUID(),
        inventoryItemId: l.itemId,
        accountId: 'default',
        movementType: 'IN',
        qty: l.quantity,
        unitCostAtTime,
        totalCost,
        weightedAvgCostAfter: newWac,
        stockQtyAfter: newQtyAfter,
        referenceType: 'invoice',
        referenceId,
        occurredAt,
        createdAt,
      })
      .run();
  }
}

// ---------------------------------------------------------------------------
// Exported data access functions
// ---------------------------------------------------------------------------

export async function saveInvoice(payload: ISaveInvoicePayload): Promise<void> {
  const db = getDb();
  const createdAt = new Date();

  db.transaction((tx) => {
    tx.insert(schema.invoices)
      .values({
        id: payload.id,
        supplierId: payload.supplierId ?? null,
        accountId: 'default',
        invoiceNumber: payload.invoiceNumber ?? null,
        invoiceDate: payload.invoiceDate ?? null,
        createdAt,
      })
      .run();

    const validLines = payload.lines.filter(
      (l) => l.itemId && l.itemNameSnapshot && l.quantity >= 0 && l.totalVatExclude >= 0,
    );

    if (validLines.length > 0) {
      tx.insert(schema.invoiceLineItems)
        .values(
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
          })),
        )
        .run();

      insertMovementsForLines(
        tx,
        validLines,
        payload.id,
        payload.invoiceDate ?? createdAt,
        createdAt,
      );
    }
  });
}

export async function updateInvoice(payload: IUpdateInvoicePayload): Promise<void> {
  const db = getDb();
  const editedAt = new Date();

  // Snapshot current state BEFORE the transaction (getInvoiceById is async)
  const current = await getInvoiceById(payload.id);
  if (!current) throw new Error(`Invoice not found: ${payload.id}`);

  const validLines = payload.lines.filter(
    (l) => l.itemId && l.itemNameSnapshot && l.quantity >= 0 && l.totalVatExclude >= 0,
  );

  db.transaction((tx) => {
    // 1. Write audit entry with pre-edit snapshot
    tx.insert(schema.invoiceAuditLog)
      .values({
        id: randomUUID(),
        invoiceId: payload.id,
        editedAt,
        note: payload.note ?? null,
        snapshot: JSON.stringify(current),
      })
      .run();

    // 2. Delete old movements for this invoice
    tx.delete(schema.stockMovements)
      .where(
        and(
          eq(schema.stockMovements.referenceType, 'invoice'),
          eq(schema.stockMovements.referenceId, payload.id),
        ),
      )
      .run();

    // 3. Delete old line items
    tx.delete(schema.invoiceLineItems)
      .where(eq(schema.invoiceLineItems.invoiceId, payload.id))
      .run();

    // 4. Re-insert lines
    if (validLines.length > 0) {
      tx.insert(schema.invoiceLineItems)
        .values(
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
          })),
        )
        .run();

      // 5. Re-compute WAC movements (uses current snapshot's invoiceDate)
      insertMovementsForLines(
        tx,
        validLines,
        payload.id,
        current.invoiceDate ?? editedAt,
        editedAt,
      );
    }

    // 6. Stamp updatedAt
    tx.update(schema.invoices)
      .set({ updatedAt: editedAt })
      .where(eq(schema.invoices.id, payload.id))
      .run();
  });
}

export async function getInvoices(): Promise<IInvoice[]> {
  const rows = getDb()
    .select()
    .from(schema.invoices)
    .orderBy(desc(schema.invoices.createdAt))
    .all();
  return rows.map(toInvoice);
}

export async function getInvoicesWithLines(): Promise<IInvoiceWithLines[]> {
  const db = getDb();
  const invoiceRows = db
    .select()
    .from(schema.invoices)
    .orderBy(desc(schema.invoices.createdAt))
    .all();

  if (invoiceRows.length === 0) return [];

  const lineRows = db.select().from(schema.invoiceLineItems).all();

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

export async function getInvoiceById(id: string): Promise<IInvoiceWithLines | null> {
  const db = getDb();
  const inv = db
    .select()
    .from(schema.invoices)
    .where(eq(schema.invoices.id, id))
    .limit(1)
    .get();
  if (!inv) return null;

  const lineRows = db
    .select()
    .from(schema.invoiceLineItems)
    .where(eq(schema.invoiceLineItems.invoiceId, id))
    .all();

  return {
    ...toInvoice(inv),
    lines: lineRows.map(toLine),
  };
}

export async function getLinesForAnalysis(): Promise<IInvoiceLineWithDate[]> {
  const rows = getDb()
    .select({
      id: schema.invoiceLineItems.id,
      invoiceId: schema.invoiceLineItems.invoiceId,
      itemId: schema.invoiceLineItems.itemId,
      itemNameSnapshot: schema.invoiceLineItems.itemNameSnapshot,
      unitOfMeasure: schema.invoiceLineItems.unitOfMeasure,
      quantity: schema.invoiceLineItems.quantity,
      vatMode: schema.invoiceLineItems.vatMode,
      vatRate: schema.invoiceLineItems.vatRate,
      totalVatExclude: schema.invoiceLineItems.totalVatExclude,
      createdAt: schema.invoices.createdAt,
      categoryType: schema.inventoryCategories.type,
      categoryName: schema.inventoryCategories.name,
    })
    .from(schema.invoiceLineItems)
    .innerJoin(schema.invoices, eq(schema.invoiceLineItems.invoiceId, schema.invoices.id))
    .leftJoin(
      schema.inventoryItems,
      eq(schema.invoiceLineItems.itemId, schema.inventoryItems.id),
    )
    .leftJoin(
      schema.inventoryCategories,
      eq(schema.inventoryItems.categoryId, schema.inventoryCategories.id),
    )
    .orderBy(asc(schema.invoices.createdAt))
    .all();

  return rows.map((r) => ({
    ...toLine(r),
    createdAt: r.createdAt,
    categoryType: r.categoryType ?? null,
    categoryName: r.categoryName ?? null,
  }));
}

export async function getLastUnitPrices(): Promise<Record<string, number>> {
  const rows = getDb()
    .select({
      itemId: schema.invoiceLineItems.itemId,
      quantity: schema.invoiceLineItems.quantity,
      totalVatExclude: schema.invoiceLineItems.totalVatExclude,
    })
    .from(schema.invoiceLineItems)
    .innerJoin(schema.invoices, eq(schema.invoiceLineItems.invoiceId, schema.invoices.id))
    .where(gt(schema.invoiceLineItems.quantity, 0))
    .orderBy(desc(schema.invoices.createdAt))
    .all();

  const result: Record<string, number> = {};
  for (const row of rows) {
    if (!(row.itemId in result)) {
      result[row.itemId] = row.totalVatExclude / row.quantity;
    }
  }
  return result;
}

export async function getInvoiceAudit(invoiceId: string): Promise<IInvoiceAuditEntry[]> {
  const rows = getDb()
    .select()
    .from(schema.invoiceAuditLog)
    .where(eq(schema.invoiceAuditLog.invoiceId, invoiceId))
    .orderBy(desc(schema.invoiceAuditLog.editedAt))
    .all();

  return rows.map((r) => ({
    id: r.id,
    invoiceId: r.invoiceId,
    editedAt: r.editedAt,
    note: r.note,
    snapshot: JSON.parse(r.snapshot) as IInvoiceWithLines,
  }));
}

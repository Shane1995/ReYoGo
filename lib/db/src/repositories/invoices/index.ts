import { and, asc, desc, eq, gt } from 'drizzle-orm';
import { MovementType } from '@reyogo/types';
import type {
  Invoice,
  InvoiceWithLines,
  InvoiceLine,
  InvoiceLineWithDate,
  InvoiceAuditEntry,
  SaveInvoicePayload,
  UpdateInvoicePayload,
  InvoiceStatus,
} from '@reyogo/types';
import type { DbClient } from '../../client';
import * as schema from '../../schema';
import { calculateWAC } from '../../utils/wac';
import { now } from '../../utils/timestamps';
import { generateId } from '../../utils/ids';

type TxClient = Parameters<DbClient['transaction']>[0] extends (tx: infer T) => Promise<unknown>
  ? T
  : never;

function toInvoice(row: schema.InvoiceRow): Invoice {
  return {
    id: row.id,
    supplierId: row.supplierId ?? null,
    invoiceNumber: row.invoiceNumber ?? null,
    invoiceDate: row.invoiceDate ?? null,
    status: row.status as InvoiceStatus,
    totalExclTax: row.totalExclTax,
    taxAmount: row.taxAmount,
    totalInclTax: row.totalInclTax,
  };
}

function toLine(row: schema.InvoiceLineItemRow): InvoiceLine {
  return {
    id: row.id,
    invoiceId: row.invoiceId,
    inventoryItemId: row.inventoryItemId,
    qty: row.qty,
    unitCost: row.unitCost,
    totalCost: row.totalCost,
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

async function insertMovementsForLines(
  tx: TxClient,
  lines: SaveInvoicePayload['lines'],
  referenceId: string,
  occurredAt: Date,
  createdAt: Date,
): Promise<void> {
  for (const line of lines.filter((l) => l.qty > 0)) {
    const prev = await getLatestMovement(tx, line.inventoryItemId);
    const newWac = calculateWAC(
      prev?.stockQtyAfter ?? 0,
      prev?.weightedAvgCostAfter ?? null,
      line.qty,
      line.unitCost,
    );
    const newQty = (prev?.stockQtyAfter ?? 0) + line.qty;
    await tx.insert(schema.stockMovements).values({
      id: generateId(),
      inventoryItemId: line.inventoryItemId,
      accountId: 'default',
      movementType: MovementType.In,
      qty: line.qty,
      unitCostAtTime: line.unitCost,
      totalCost: line.totalCost,
      weightedAvgCostAfter: newWac,
      stockQtyAfter: newQty,
      referenceType: 'invoice',
      referenceId,
      occurredAt,
      createdAt,
    });
  }
}

export function createInvoicesRepo(db: DbClient) {
  return {
    async saveInvoice(payload: SaveInvoicePayload): Promise<void> {
      const createdAt = now();
      await db.transaction(async (tx) => {
        await tx.insert(schema.invoices).values({
          id: payload.id,
          supplierId: payload.supplierId ?? null,
          accountId: 'default',
          invoiceNumber: payload.invoiceNumber ?? null,
          invoiceDate: payload.invoiceDate ?? null,
          status: payload.status,
          totalExclTax: payload.totalExclTax,
          taxAmount: payload.taxAmount,
          totalInclTax: payload.totalInclTax,
          createdAt,
        });
        const validLines = payload.lines.filter(
          (l) => l.inventoryItemId && l.qty >= 0 && l.totalCost >= 0,
        );
        if (validLines.length > 0) {
          await tx.insert(schema.invoiceLineItems).values(
            validLines.map((l) => ({
              id: l.id,
              invoiceId: payload.id,
              inventoryItemId: l.inventoryItemId,
              qty: l.qty,
              unitCost: l.unitCost,
              totalCost: l.totalCost,
            })),
          );
          await insertMovementsForLines(
            tx,
            validLines,
            payload.id,
            payload.invoiceDate ?? createdAt,
            createdAt,
          );
        }
      });
    },

    async updateInvoice(payload: UpdateInvoicePayload): Promise<void> {
      const editedAt = now();
      const current = await this.getInvoiceById(payload.id);
      if (!current) throw new Error(`Invoice not found: ${payload.id}`);
      const validLines = payload.lines.filter(
        (l) => l.inventoryItemId && l.qty >= 0 && l.totalCost >= 0,
      );
      await db.transaction(async (tx) => {
        await tx.insert(schema.invoiceAuditLog).values({
          id: generateId(),
          invoiceId: payload.id,
          editedAt,
          note: payload.note ?? null,
          snapshot: JSON.stringify(current),
        });
        await tx
          .delete(schema.stockMovements)
          .where(
            and(
              eq(schema.stockMovements.referenceType, 'invoice'),
              eq(schema.stockMovements.referenceId, payload.id),
            ),
          );
        await tx
          .delete(schema.invoiceLineItems)
          .where(eq(schema.invoiceLineItems.invoiceId, payload.id));
        if (validLines.length > 0) {
          await tx.insert(schema.invoiceLineItems).values(
            validLines.map((l) => ({
              id: l.id,
              invoiceId: payload.id,
              inventoryItemId: l.inventoryItemId,
              qty: l.qty,
              unitCost: l.unitCost,
              totalCost: l.totalCost,
            })),
          );
          await insertMovementsForLines(
            tx,
            validLines,
            payload.id,
            current.invoiceDate ?? editedAt,
            editedAt,
          );
        }
        await tx
          .update(schema.invoices)
          .set({ updatedAt: editedAt })
          .where(eq(schema.invoices.id, payload.id));
      });
    },

    async getInvoices(): Promise<Invoice[]> {
      const rows = await db.select().from(schema.invoices).orderBy(desc(schema.invoices.createdAt));
      return rows.map(toInvoice);
    },

    async getInvoicesWithLines(): Promise<InvoiceWithLines[]> {
      const invoiceRows = await db
        .select()
        .from(schema.invoices)
        .orderBy(desc(schema.invoices.createdAt));
      if (invoiceRows.length === 0) return [];
      const lineRows = await db.select().from(schema.invoiceLineItems);
      const linesByInvoice = new Map<string, typeof lineRows>();
      for (const line of lineRows) {
        if (!linesByInvoice.has(line.invoiceId)) linesByInvoice.set(line.invoiceId, []);
        linesByInvoice.get(line.invoiceId)!.push(line);
      }
      return invoiceRows.map((inv) => ({
        ...toInvoice(inv),
        lines: (linesByInvoice.get(inv.id) ?? []).map(toLine),
      }));
    },

    async getInvoiceById(id: string): Promise<InvoiceWithLines | null> {
      const invRows = await db
        .select()
        .from(schema.invoices)
        .where(eq(schema.invoices.id, id))
        .limit(1);
      if (!invRows[0]) return null;
      const lineRows = await db
        .select()
        .from(schema.invoiceLineItems)
        .where(eq(schema.invoiceLineItems.invoiceId, id));
      return { ...toInvoice(invRows[0]), lines: lineRows.map(toLine) };
    },

    async getLinesForAnalysis(): Promise<InvoiceLineWithDate[]> {
      const rows = await db
        .select({
          id: schema.invoiceLineItems.id,
          invoiceId: schema.invoiceLineItems.invoiceId,
          inventoryItemId: schema.invoiceLineItems.inventoryItemId,
          qty: schema.invoiceLineItems.qty,
          unitCost: schema.invoiceLineItems.unitCost,
          totalCost: schema.invoiceLineItems.totalCost,
          invoiceCreatedAt: schema.invoices.createdAt,
          categoryType: schema.inventoryCategories.type,
          categoryName: schema.inventoryCategories.name,
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
        .orderBy(asc(schema.invoices.createdAt));
      return rows.map((r) => ({
        id: r.id,
        invoiceId: r.invoiceId,
        inventoryItemId: r.inventoryItemId,
        qty: r.qty,
        unitCost: r.unitCost,
        totalCost: r.totalCost,
        invoiceCreatedAt: r.invoiceCreatedAt,
        categoryType: r.categoryType ?? null,
        categoryName: r.categoryName ?? null,
      }));
    },

    async getLastUnitPrices(): Promise<Record<string, number>> {
      const rows = await db
        .select({
          inventoryItemId: schema.invoiceLineItems.inventoryItemId,
          unitCost: schema.invoiceLineItems.unitCost,
        })
        .from(schema.invoiceLineItems)
        .innerJoin(schema.invoices, eq(schema.invoiceLineItems.invoiceId, schema.invoices.id))
        .where(gt(schema.invoiceLineItems.qty, 0))
        .orderBy(desc(schema.invoices.createdAt));
      const result: Record<string, number> = {};
      for (const row of rows) {
        if (!(row.inventoryItemId in result)) result[row.inventoryItemId] = row.unitCost;
      }
      return result;
    },

    async getInvoiceAudit(invoiceId: string): Promise<InvoiceAuditEntry[]> {
      const rows = await db
        .select()
        .from(schema.invoiceAuditLog)
        .where(eq(schema.invoiceAuditLog.invoiceId, invoiceId))
        .orderBy(desc(schema.invoiceAuditLog.editedAt));
      return rows.map((r) => ({
        id: r.id,
        invoiceId: r.invoiceId,
        editedAt: r.editedAt,
        note: r.note,
        snapshot: JSON.parse(r.snapshot) as InvoiceWithLines,
      }));
    },
  };
}

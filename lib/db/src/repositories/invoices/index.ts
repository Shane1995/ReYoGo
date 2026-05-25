import { and, asc, desc, eq, gt } from 'drizzle-orm';
import type {
  IInvoice,
  IInvoiceWithLines,
  IInvoiceLine,
  IInvoiceLineWithDate,
  IInvoiceAuditEntry,
  ISaveInvoicePayload,
  IUpdateInvoicePayload,
  MovementType,
} from '@reyogo/types';
import type { DbClient } from '../../client';
import * as schema from '../../schema';
import { calculateWAC } from '../../utils/wac';
import { now } from '../../utils/timestamps';
import { generateId } from '../../utils/ids';

type TxClient = Parameters<DbClient['transaction']>[0] extends (tx: infer T) => Promise<unknown>
  ? T
  : never;

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
  inventoryItemId: string;
  qty: number;
  unitCost: number;
  totalCost: number;
}): IInvoiceLine {
  return {
    id: row.id,
    invoiceId: row.invoiceId,
    itemId: row.inventoryItemId,
    itemNameSnapshot: '',
    unitOfMeasure: null,
    quantity: row.qty,
    vatMode: 'exclusive',
    vatRate: 0,
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

async function insertMovementsForLines(
  tx: TxClient,
  lines: ISaveInvoicePayload['lines'],
  referenceId: string,
  occurredAt: Date,
  createdAt: Date,
): Promise<void> {
  for (const line of lines.filter((l) => l.quantity > 0)) {
    const unitCostAtTime = line.totalVatExclude / line.quantity;
    const prev = await getLatestMovement(tx, line.itemId);
    const newWac = calculateWAC(
      prev?.stockQtyAfter ?? 0,
      prev?.weightedAvgCostAfter ?? null,
      line.quantity,
      unitCostAtTime,
    );
    const newQty = (prev?.stockQtyAfter ?? 0) + line.quantity;
    await tx.insert(schema.stockMovements).values({
      id: generateId(),
      inventoryItemId: line.itemId,
      accountId: 'default',
      movementType: 'IN' as MovementType,
      qty: line.quantity,
      unitCostAtTime,
      totalCost: line.quantity * unitCostAtTime,
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
    async saveInvoice(payload: ISaveInvoicePayload): Promise<void> {
      const createdAt = now();
      await db.transaction(async (tx) => {
        await tx.insert(schema.invoices).values({
          id: payload.id,
          supplierId: payload.supplierId ?? null,
          accountId: 'default',
          invoiceNumber: payload.invoiceNumber ?? null,
          invoiceDate: payload.invoiceDate ?? null,
          createdAt,
        });
        const validLines = payload.lines.filter(
          (l) => l.itemId && l.itemNameSnapshot && l.quantity >= 0 && l.totalVatExclude >= 0,
        );
        if (validLines.length > 0) {
          await tx.insert(schema.invoiceLineItems).values(
            validLines.map((l) => ({
              id: l.id,
              invoiceId: payload.id,
              inventoryItemId: l.itemId,
              qty: l.quantity,
              unitCost: l.quantity > 0 ? l.totalVatExclude / l.quantity : 0,
              totalCost: l.totalVatExclude,
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

    async updateInvoice(payload: IUpdateInvoicePayload): Promise<void> {
      const editedAt = now();
      const current = await this.getInvoiceById(payload.id);
      if (!current) throw new Error(`Invoice not found: ${payload.id}`);
      const validLines = payload.lines.filter(
        (l) => l.itemId && l.itemNameSnapshot && l.quantity >= 0 && l.totalVatExclude >= 0,
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
              inventoryItemId: l.itemId,
              qty: l.quantity,
              unitCost: l.quantity > 0 ? l.totalVatExclude / l.quantity : 0,
              totalCost: l.totalVatExclude,
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

    async getInvoices(): Promise<IInvoice[]> {
      const rows = await db.select().from(schema.invoices).orderBy(desc(schema.invoices.createdAt));
      return rows.map(toInvoice);
    },

    async getInvoicesWithLines(): Promise<IInvoiceWithLines[]> {
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

    async getInvoiceById(id: string): Promise<IInvoiceWithLines | null> {
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

    async getLinesForAnalysis(): Promise<IInvoiceLineWithDate[]> {
      const rows = await db
        .select({
          id: schema.invoiceLineItems.id,
          invoiceId: schema.invoiceLineItems.invoiceId,
          inventoryItemId: schema.invoiceLineItems.inventoryItemId,
          qty: schema.invoiceLineItems.qty,
          unitCost: schema.invoiceLineItems.unitCost,
          totalCost: schema.invoiceLineItems.totalCost,
          createdAt: schema.invoices.createdAt,
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
        ...toLine(r),
        createdAt: r.createdAt,
        categoryType: r.categoryType ?? null,
        categoryName: r.categoryName ?? null,
      }));
    },

    async getLastUnitPrices(): Promise<Record<string, number>> {
      const rows = await db
        .select({
          inventoryItemId: schema.invoiceLineItems.inventoryItemId,
          qty: schema.invoiceLineItems.qty,
          totalCost: schema.invoiceLineItems.totalCost,
        })
        .from(schema.invoiceLineItems)
        .innerJoin(schema.invoices, eq(schema.invoiceLineItems.invoiceId, schema.invoices.id))
        .where(gt(schema.invoiceLineItems.qty, 0))
        .orderBy(desc(schema.invoices.createdAt));
      const result: Record<string, number> = {};
      for (const row of rows) {
        if (!(row.inventoryItemId in result))
          result[row.inventoryItemId] = row.qty > 0 ? row.totalCost / row.qty : 0;
      }
      return result;
    },

    async getInvoiceAudit(invoiceId: string): Promise<IInvoiceAuditEntry[]> {
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
        snapshot: JSON.parse(r.snapshot) as IInvoiceWithLines,
      }));
    },
  };
}

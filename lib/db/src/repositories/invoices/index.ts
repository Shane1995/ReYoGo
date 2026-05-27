import { and, asc, desc, eq, gt } from 'drizzle-orm';
import { MovementType } from '@reyogo/types';
import type {
  IInvoice,
  IInvoiceWithLines,
  IInvoiceLine,
  IInvoiceAuditEntry,
  ISaveCapturedInvoicePayload,
  IUpdateCapturedInvoicePayload,
  VatMode,
  InvoiceLineWithDate,
} from '@reyogo/types';
import type { DbClient } from '../../client';
import * as schema from '../../schema';
import { calculateWAC } from '../../utils/wac';
import { now } from '../../utils/timestamps';
import { generateId } from '../../utils/ids';

type TxClient = Parameters<DbClient['transaction']>[0] extends (tx: infer T) => Promise<unknown>
  ? T
  : never;

function toIInvoice(row: schema.InvoiceRow): IInvoice {
  return {
    id: row.id,
    supplierId: row.supplierId ?? null,
    invoiceNumber: row.invoiceNumber ?? null,
    invoiceDate: row.invoiceDate ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? null,
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
    vatMode: (row.vatMode as VatMode) ?? 'exclusive',
    vatRate: row.vatRate ?? 15,
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
  lines: ISaveCapturedInvoicePayload['lines'],
  referenceId: string,
  occurredAt: Date,
  createdAt: Date,
): Promise<void> {
  for (const line of lines.filter((l) => l.quantity > 0)) {
    const prev = await getLatestMovement(tx, line.itemId);
    const unitCost = line.quantity > 0 ? line.totalVatExclude / line.quantity : 0;
    const newWac = calculateWAC(
      prev?.stockQtyAfter ?? 0,
      prev?.weightedAvgCostAfter ?? null,
      line.quantity,
      unitCost,
    );
    const newQty = (prev?.stockQtyAfter ?? 0) + line.quantity;
    await tx.insert(schema.stockMovements).values({
      id: generateId(),
      inventoryItemId: line.itemId,
      accountId: 'default',
      movementType: MovementType.In,
      qty: line.quantity,
      unitCostAtTime: unitCost,
      totalCost: line.totalVatExclude,
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
    async saveInvoice(payload: ISaveCapturedInvoicePayload): Promise<void> {
      const createdAt = now();
      const totalExclTax = payload.lines.reduce((s, l) => s + l.totalVatExclude, 0);
      const taxAmount = payload.lines.reduce((s, l) => {
        if (l.vatMode === 'non-taxable') return s;
        const net =
          l.vatMode === 'inclusive' ? l.totalVatExclude / (1 + l.vatRate / 100) : l.totalVatExclude;
        return s + net * (l.vatRate / 100);
      }, 0);

      await db.transaction(async (tx) => {
        await tx.insert(schema.invoices).values({
          id: payload.id,
          supplierId: payload.supplierId ?? null,
          accountId: 'default',
          invoiceNumber: payload.invoiceNumber ?? null,
          invoiceDate: payload.invoiceDate ?? null,
          status: 'DRAFT',
          totalExclTax,
          taxAmount,
          totalInclTax: totalExclTax + taxAmount,
          createdAt,
        });

        const validLines = payload.lines.filter((l) => l.itemId && l.quantity >= 0);
        if (validLines.length > 0) {
          const unitCostOf = (l: (typeof validLines)[number]) =>
            l.quantity > 0 ? l.totalVatExclude / l.quantity : 0;
          await tx.insert(schema.invoiceLineItems).values(
            validLines.map((l) => ({
              id: l.id,
              invoiceId: payload.id,
              inventoryItemId: l.itemId,
              itemNameSnapshot: l.itemNameSnapshot ?? '',
              qty: l.quantity,
              unitCost: unitCostOf(l),
              totalCost: l.totalVatExclude,
              vatMode: l.vatMode,
              vatRate: l.vatRate,
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

    async updateInvoice(payload: IUpdateCapturedInvoicePayload): Promise<void> {
      const editedAt = now();
      const current = await this.getInvoiceById(payload.id);
      if (!current) throw new Error(`Invoice not found: ${payload.id}`);

      const validLines = payload.lines.filter((l) => l.itemId && l.quantity >= 0);
      const totalExclTax = validLines.reduce((s, l) => s + l.totalVatExclude, 0);
      const taxAmount = validLines.reduce((s, l) => {
        if (l.vatMode === 'non-taxable') return s;
        const net =
          l.vatMode === 'inclusive' ? l.totalVatExclude / (1 + l.vatRate / 100) : l.totalVatExclude;
        return s + net * (l.vatRate / 100);
      }, 0);

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
          const unitCostOf = (l: (typeof validLines)[number]) =>
            l.quantity > 0 ? l.totalVatExclude / l.quantity : 0;
          await tx.insert(schema.invoiceLineItems).values(
            validLines.map((l) => ({
              id: l.id,
              invoiceId: payload.id,
              inventoryItemId: l.itemId,
              itemNameSnapshot: l.itemNameSnapshot ?? '',
              qty: l.quantity,
              unitCost: unitCostOf(l),
              totalCost: l.totalVatExclude,
              vatMode: l.vatMode,
              vatRate: l.vatRate,
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
          .set({
            updatedAt: editedAt,
            totalExclTax,
            taxAmount,
            totalInclTax: totalExclTax + taxAmount,
          })
          .where(eq(schema.invoices.id, payload.id));
      });
    },

    async getInvoices(): Promise<IInvoice[]> {
      const rows = await db.select().from(schema.invoices).orderBy(desc(schema.invoices.createdAt));
      return rows.map(toIInvoice);
    },

    async getInvoicesWithLines(): Promise<IInvoiceWithLines[]> {
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
    },

    async getInvoiceById(id: string): Promise<IInvoiceWithLines | null> {
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
        note: r.note ?? null,
        snapshot: JSON.parse(r.snapshot) as IInvoiceWithLines,
      }));
    },
  };
}

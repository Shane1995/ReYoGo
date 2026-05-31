import { describe, it, expect, beforeEach } from 'vitest';
import { InventoryType, VatMode, MovementType, ReferenceType, InvoiceStatus } from '@reyogo/types';
import { eq } from 'drizzle-orm';
import { createTestDb, type DbClient } from '../../__tests__/helpers';
import { createInvoicesRepo } from '.';
import * as schema from '../../schema';

let db: DbClient;
let repo: ReturnType<typeof createInvoicesRepo>;

function round4(x: number) {
  return Math.round(x * 10000) / 10000;
}

function line(overrides: {
  id: string;
  itemId?: string;
  quantity?: number;
  unitPrice?: number;
  totalVatExclude?: number;
  isVatable?: boolean;
  itemNameSnapshot?: string;
}) {
  return {
    id: overrides.id,
    itemId: overrides.itemId ?? 'item-1',
    itemNameSnapshot: overrides.itemNameSnapshot ?? '',
    quantity: overrides.quantity ?? 10,
    unitPrice: overrides.unitPrice ?? 10,
    isVatable: overrides.isVatable ?? true,
    totalVatExclude: overrides.totalVatExclude ?? 100,
  };
}

beforeEach(async () => {
  db = await createTestDb();
  repo = createInvoicesRepo(db);
  await db.insert(schema.inventoryCategories).values({
    id: 'cat-1',
    accountId: 'default',
    name: 'Food',
    type: InventoryType.Food,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await db.insert(schema.inventoryItems).values([
    {
      id: 'item-1',
      accountId: 'default',
      entityId: 'default',
      name: 'Flour',
      categoryId: 'cat-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'item-2',
      accountId: 'default',
      entityId: 'default',
      name: 'Sugar',
      categoryId: 'cat-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
});

describe('createInvoicesRepo', () => {
  describe('saveInvoice', () => {
    it('creates the invoice and its line items', async () => {
      await repo.saveInvoice({
        id: 'inv-1',
        entityId: 'default',
        supplierId: null,
        invoiceDate: null,
        invoiceNumber: 'INV-001',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l-1', quantity: 10, totalVatExclude: 50 })],
      });
      const invoices = await db.select().from(schema.invoices);
      expect(invoices).toHaveLength(1);
      expect(invoices[0]!.invoiceNumber).toBe('INV-001');
      expect(await db.select().from(schema.invoiceLineItems)).toHaveLength(1);
    });

    it('saves with DRAFT status and no stock movements', async () => {
      await repo.saveInvoice({
        id: 'inv-1',
        entityId: 'default',
        supplierId: null,
        invoiceDate: null,
        invoiceNumber: 'INV-TEST',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l-1', quantity: 10, totalVatExclude: 100 })],
      });
      const invoices = await db.select().from(schema.invoices);
      expect(invoices[0]!.status).toBe('DRAFT');
      expect(await db.select().from(schema.stockMovements)).toHaveLength(0);
    });

    it('computes zero tax for non-vatable lines', async () => {
      await repo.saveInvoice({
        id: 'inv-1',
        entityId: 'default',
        supplierId: null,
        invoiceDate: null,
        invoiceNumber: 'INV-TEST',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l-1', quantity: 10, totalVatExclude: 100, isVatable: false })],
      });
      const invoices = await db.select().from(schema.invoices);
      expect(invoices[0]!.taxAmount).toBe(0);
    });
  });

  describe('saveAndPostInvoice', () => {
    it('creates the invoice as POSTED with stock movements in one step', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-1',
        entityId: 'default',
        supplierId: null,
        invoiceNumber: 'INV-001',
        invoiceDate: new Date('2024-01-01'),
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l-1', quantity: 10, totalVatExclude: 100 })],
      });
      const invoices = await db.select().from(schema.invoices);
      expect(invoices[0]!.status).toBe('POSTED');
      const movements = await db.select().from(schema.stockMovements);
      expect(movements).toHaveLength(1);
      expect(movements[0]!.unitCostAtTime).toBe(10);
      expect(movements[0]!.weightedAvgCostAfter).toBe(10);
      expect(movements[0]!.stockQtyAfter).toBe(10);
    });

    it('uses invoiceDate as occurredAt when provided', async () => {
      const invoiceDate = new Date('2024-03-15');
      await repo.saveAndPostInvoice({
        id: 'inv-1',
        entityId: 'default',
        supplierId: null,
        invoiceNumber: 'INV-TEST',
        invoiceDate,
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l-1', quantity: 5, totalVatExclude: 50 })],
      });
      const movements = await db.select().from(schema.stockMovements);
      expect(movements[0]!.occurredAt).toEqual(invoiceDate);
    });

    it('skips lines with zero quantity for movements', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-1',
        entityId: 'default',
        supplierId: null,
        invoiceNumber: 'INV-TEST',
        invoiceDate: null,
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [
          line({ id: 'l-1', quantity: 10, totalVatExclude: 100 }),
          line({ id: 'l-2', quantity: 0, totalVatExclude: 0 }),
        ],
      });
      const movements = await db.select().from(schema.stockMovements);
      expect(movements).toHaveLength(1);
    });
  });

  describe('postInvoice', () => {
    beforeEach(() =>
      repo.saveInvoice({
        id: 'inv-1',
        entityId: 'default',
        supplierId: null,
        invoiceNumber: 'INV-001',
        invoiceDate: new Date('2024-01-01'),
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l-1', quantity: 10, totalVatExclude: 100 })],
      }),
    );

    it('creates stock movements and transitions status to POSTED', async () => {
      await repo.postInvoice('inv-1');
      const invoices = await db.select().from(schema.invoices);
      expect(invoices[0]!.status).toBe('POSTED');
      const movements = await db.select().from(schema.stockMovements);
      expect(movements).toHaveLength(1);
      expect(movements[0]!.unitCostAtTime).toBe(10);
      expect(movements[0]!.weightedAvgCostAfter).toBe(10);
      expect(movements[0]!.stockQtyAfter).toBe(10);
    });

    it('blends WAC correctly across two posted invoices', async () => {
      await repo.saveInvoice({
        id: 'inv-2',
        entityId: 'default',
        supplierId: null,
        invoiceNumber: 'INV-TEST',
        invoiceDate: new Date('2024-01-02'),
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l-2', quantity: 10, totalVatExclude: 200 })],
      });
      await repo.postInvoice('inv-1');
      await repo.postInvoice('inv-2');
      const movements = await db
        .select()
        .from(schema.stockMovements)
        .orderBy(schema.stockMovements.occurredAt);
      expect(movements[1]!.weightedAvgCostAfter).toBe(round4((10 * 10 + 10 * 20) / 20));
      expect(movements[1]!.stockQtyAfter).toBe(20);
    });

    it('throws when already posted', async () => {
      await repo.postInvoice('inv-1');
      await expect(repo.postInvoice('inv-1')).rejects.toThrow();
    });

    it('throws when invoice does not exist', async () => {
      await expect(repo.postInvoice('nope')).rejects.toThrow();
    });
  });

  describe('updateInvoice', () => {
    beforeEach(() =>
      repo.saveInvoice({
        id: 'inv-1',
        entityId: 'default',
        supplierId: null,
        invoiceNumber: 'INV-001',
        invoiceDate: new Date('2024-01-01'),
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l-1', quantity: 10, totalVatExclude: 100 })],
      }),
    );

    it('replaces draft line items with the new set', async () => {
      await repo.updateInvoice({
        id: 'inv-1',
        lines: [line({ id: 'l-2', itemId: 'item-2', quantity: 5, totalVatExclude: 50 })],
      });
      const lines = await db.select().from(schema.invoiceLineItems);
      expect(lines).toHaveLength(1);
      expect(lines[0]!.inventoryItemId).toBe('item-2');
      expect(await db.select().from(schema.stockMovements)).toHaveLength(0);
    });

    it('writes an audit log entry with the previous invoice snapshot', async () => {
      await repo.updateInvoice({ id: 'inv-1', note: 'Correction', lines: [] });
      const audit = await db.select().from(schema.invoiceAuditLog);
      expect(audit).toHaveLength(1);
      expect(audit[0]!.note).toBe('Correction');
      expect((JSON.parse(audit[0]!.snapshot) as { id: string }).id).toBe('inv-1');
    });

    it('throws when the invoice does not exist', async () => {
      await expect(repo.updateInvoice({ id: 'nope', lines: [] })).rejects.toThrow();
    });

    it('throws when the invoice is already posted', async () => {
      await repo.postInvoice('inv-1');
      await expect(repo.updateInvoice({ id: 'inv-1', lines: [] })).rejects.toThrow();
    });
  });

  describe('getInvoices', () => {
    it('returns empty array when no invoices exist', async () => {
      expect(await repo.getInvoices()).toEqual([]);
    });

    it('returns all invoices ordered by createdAt descending', async () => {
      await repo.saveInvoice({
        id: 'inv-1',
        entityId: 'default',
        supplierId: null,
        invoiceNumber: 'INV-TEST',
        invoiceDate: null,
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [],
      });
      await repo.saveInvoice({
        id: 'inv-2',
        entityId: 'default',
        supplierId: null,
        invoiceNumber: 'INV-TEST',
        invoiceDate: null,
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [],
      });
      const invoices = await repo.getInvoices();
      expect(invoices).toHaveLength(2);
    });
  });

  describe('getInvoiceById', () => {
    it('returns null for an unknown id', async () => {
      expect(await repo.getInvoiceById('nope')).toBeNull();
    });

    it('returns the invoice with its lines', async () => {
      await repo.saveInvoice({
        id: 'inv-1',
        entityId: 'default',
        supplierId: null,
        invoiceNumber: 'INV-001',
        invoiceDate: null,
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l-1', quantity: 10, totalVatExclude: 100 })],
      });
      const result = await repo.getInvoiceById('inv-1');
      expect(result!.invoiceNumber).toBe('INV-001');
      expect(result!.lines).toHaveLength(1);
    });
  });

  describe('getLastUnitPrices', () => {
    it('returns the most recent unit price per item', async () => {
      await repo.saveInvoice({
        id: 'inv-1',
        entityId: 'default',
        supplierId: null,
        invoiceNumber: 'INV-TEST',
        invoiceDate: null,
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l-1', quantity: 10, totalVatExclude: 100 })],
      });
      expect((await repo.getLastUnitPrices())['item-1']).toBe(10);
    });

    it('returns empty object when no lines exist', async () => {
      expect(await repo.getLastUnitPrices()).toEqual({});
    });
  });

  describe('saveCreditNote', () => {
    it('creates a credit note invoice linked to the source', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-1',
        entityId: 'default',
        invoiceNumber: 'INV-001',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'line-1', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });

      await repo.saveCreditNote({
        id: 'cn-1',
        sourceInvoiceId: 'inv-1',
        entityId: 'default',
        invoiceNumber: 'CN-INV-001',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'cn-line-1', itemId: 'item-1', quantity: 3, totalVatExclude: 30 })],
      });

      const cn = await repo.getInvoiceById('cn-1');
      expect(cn).not.toBeNull();
      expect(cn!.status).toBe(InvoiceStatus.CreditNote);
      expect(cn!.sourceInvoiceId).toBe('inv-1');
      expect(cn!.lines).toHaveLength(1);
      expect(cn!.lines[0]!.quantity).toBe(3);
    });

    it('creates a negative stock movement dated to now', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-2',
        entityId: 'default',
        invoiceNumber: 'INV-002',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'line-2', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });

      await repo.saveCreditNote({
        id: 'cn-2',
        sourceInvoiceId: 'inv-2',
        entityId: 'default',
        invoiceNumber: 'CN-INV-002',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'cn-line-2', itemId: 'item-1', quantity: 4, totalVatExclude: 40 })],
      });

      const movements = await db
        .select()
        .from(schema.stockMovements)
        .where(eq(schema.stockMovements.referenceId, 'cn-2'));

      expect(movements).toHaveLength(1);
      expect(movements[0]!.qty).toBe(-4);
      expect(movements[0]!.movementType).toBe(MovementType.Return);
      expect(movements[0]!.referenceType).toBe(ReferenceType.CreditNote);
      expect(movements[0]!.stockQtyAfter).toBe(6);
    });

    it('writes an audit log entry on the source invoice', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-3',
        entityId: 'default',
        invoiceNumber: 'INV-003',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'line-3', itemId: 'item-1', quantity: 5, totalVatExclude: 50 })],
      });

      await repo.saveCreditNote({
        id: 'cn-3',
        sourceInvoiceId: 'inv-3',
        entityId: 'default',
        invoiceNumber: 'CN-INV-003',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'cn-line-3', itemId: 'item-1', quantity: 2, totalVatExclude: 20 })],
      });

      const audit = await repo.getInvoiceAudit('inv-3');
      expect(audit).toHaveLength(1);
      expect(audit[0]!.note).toContain('CN-INV-003');
    });

    it('rejects when credited quantity exceeds original invoice quantity', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-4',
        entityId: 'default',
        invoiceNumber: 'INV-004',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'line-4', itemId: 'item-1', quantity: 5, totalVatExclude: 50 })],
      });

      await expect(
        repo.saveCreditNote({
          id: 'cn-4',
          sourceInvoiceId: 'inv-4',
          entityId: 'default',
          invoiceNumber: 'CN-INV-004',
          vatMode: VatMode.Exclusive,
          vatRate: 15,
          lines: [line({ id: 'cn-line-4', itemId: 'item-1', quantity: 6, totalVatExclude: 60 })],
        }),
      ).rejects.toThrow();
    });

    it('rejects cumulative overcrediting across multiple credit notes', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-5',
        entityId: 'default',
        invoiceNumber: 'INV-005',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'line-5', itemId: 'item-1', quantity: 5, totalVatExclude: 50 })],
      });

      await repo.saveCreditNote({
        id: 'cn-5a',
        sourceInvoiceId: 'inv-5',
        entityId: 'default',
        invoiceNumber: 'CN-INV-005-1',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'cn-line-5a', itemId: 'item-1', quantity: 3, totalVatExclude: 30 })],
      });

      await expect(
        repo.saveCreditNote({
          id: 'cn-5b',
          sourceInvoiceId: 'inv-5',
          entityId: 'default',
          invoiceNumber: 'CN-INV-005-2',
          vatMode: VatMode.Exclusive,
          vatRate: 15,
          lines: [line({ id: 'cn-line-5b', itemId: 'item-1', quantity: 3, totalVatExclude: 30 })],
        }),
      ).rejects.toThrow();
    });

    it('rejects credit notes against non-posted invoices', async () => {
      await repo.saveInvoice({
        id: 'inv-6',
        entityId: 'default',
        invoiceNumber: 'INV-006',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'line-6', itemId: 'item-1', quantity: 5, totalVatExclude: 50 })],
      });

      await expect(
        repo.saveCreditNote({
          id: 'cn-6',
          sourceInvoiceId: 'inv-6',
          entityId: 'default',
          invoiceNumber: 'CN-INV-006',
          vatMode: VatMode.Exclusive,
          vatRate: 15,
          lines: [line({ id: 'cn-line-6', itemId: 'item-1', quantity: 2, totalVatExclude: 20 })],
        }),
      ).rejects.toThrow('posted');
    });

    it('recomputes totalVatExclude from unitPrice × quantity, ignoring passed totalVatExclude', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-r',
        entityId: 'default',
        invoiceNumber: 'INV-R',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [
          line({ id: 'l-r', itemId: 'item-1', quantity: 10, totalVatExclude: 100, unitPrice: 10 }),
        ],
      });

      await repo.saveCreditNote({
        id: 'cn-r',
        sourceInvoiceId: 'inv-r',
        entityId: 'default',
        invoiceNumber: 'CN-INV-R',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [
          {
            id: 'cn-l-r',
            itemId: 'item-1',
            itemNameSnapshot: '',
            quantity: 3,
            unitPrice: 12,
            isVatable: true,
            totalVatExclude: 999,
          },
        ],
      });

      const cn = await repo.getInvoiceById('cn-r');
      expect(cn!.lines[0]!.totalVatExclude).toBe(36);
      const cnRow = await db
        .select()
        .from(schema.invoices)
        .where(eq(schema.invoices.id, 'cn-r'))
        .limit(1)
        .then((rows) => rows[0]);
      expect(cnRow!.totalExclTax).toBe(36);

      const lineRow = await db
        .select({ unitCost: schema.invoiceLineItems.unitCost })
        .from(schema.invoiceLineItems)
        .where(eq(schema.invoiceLineItems.invoiceId, 'cn-r'))
        .then((rows) => rows[0] ?? null);
      expect(lineRow!.unitCost).toBe(12);

      const movementRow = await db
        .select({ unitCostAtTime: schema.stockMovements.unitCostAtTime })
        .from(schema.stockMovements)
        .where(eq(schema.stockMovements.referenceId, 'cn-r'))
        .then((rows) => rows[0] ?? null);
      expect(movementRow!.unitCostAtTime).toBe(12);
    });

    it('rejects credit notes against a credit note invoice', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-8',
        entityId: 'default',
        invoiceNumber: 'INV-008',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'line-8', itemId: 'item-1', quantity: 5, totalVatExclude: 50 })],
      });

      await repo.saveCreditNote({
        id: 'cn-8',
        sourceInvoiceId: 'inv-8',
        entityId: 'default',
        invoiceNumber: 'CN-INV-008',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'cn-line-8', itemId: 'item-1', quantity: 2, totalVatExclude: 20 })],
      });

      await expect(
        repo.saveCreditNote({
          id: 'cn-8b',
          sourceInvoiceId: 'cn-8',
          entityId: 'default',
          invoiceNumber: 'CN-CN-INV-008',
          vatMode: VatMode.Exclusive,
          vatRate: 15,
          lines: [line({ id: 'cn-line-8b', itemId: 'item-1', quantity: 1, totalVatExclude: 10 })],
        }),
      ).rejects.toThrow('posted');
    });
  });

  describe('getCreditNotesForInvoice', () => {
    it('returns credit notes linked to the given invoice', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-7',
        entityId: 'default',
        invoiceNumber: 'INV-007',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'line-7', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });

      await repo.saveCreditNote({
        id: 'cn-7',
        sourceInvoiceId: 'inv-7',
        entityId: 'default',
        invoiceNumber: 'CN-INV-007',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'cn-line-7', itemId: 'item-1', quantity: 2, totalVatExclude: 20 })],
      });

      const creditNotes = await repo.getCreditNotesForInvoice('inv-7');
      expect(creditNotes).toHaveLength(1);
      expect(creditNotes[0]!.id).toBe('cn-7');
      expect(creditNotes[0]!.sourceInvoiceId).toBe('inv-7');
    });

    it('returns empty array when no credit notes exist', async () => {
      const creditNotes = await repo.getCreditNotesForInvoice('nonexistent-inv');
      expect(creditNotes).toEqual([]);
    });
  });
});

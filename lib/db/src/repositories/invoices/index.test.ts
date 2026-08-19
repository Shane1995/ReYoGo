import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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

afterEach(() => {
  vi.useRealTimers();
});

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
      entityId: 'default',
      name: 'Flour',
      categoryId: 'cat-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'item-2',
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
    it('returns exclVat as the raw unit cost', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-1',
        entityId: 'default',
        supplierId: null,
        invoiceNumber: 'INV-TEST',
        invoiceDate: null,
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l-1', quantity: 10, totalVatExclude: 100, isVatable: true })],
      });
      const result = await repo.getLastUnitPrices();
      expect(result['item-1']!.exclVat).toBe(10);
    });

    it('computes inclVat as unitCost * (1 + vatRate/100) for vatable lines', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-2',
        entityId: 'default',
        supplierId: null,
        invoiceNumber: 'INV-TEST2',
        invoiceDate: null,
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l-2', quantity: 10, totalVatExclude: 100, isVatable: true })],
      });
      const result = await repo.getLastUnitPrices();
      expect(result['item-1']!.inclVat).toBeCloseTo(11.5);
    });

    it('inclVat equals exclVat when isVatable is false', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-3',
        entityId: 'default',
        supplierId: null,
        invoiceNumber: 'INV-TEST3',
        invoiceDate: null,
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l-3', quantity: 10, totalVatExclude: 100, isVatable: false })],
      });
      const result = await repo.getLastUnitPrices();
      expect(result['item-1']!.inclVat).toBeCloseTo(10);
    });

    it('returns empty object when no lines exist', async () => {
      expect(await repo.getLastUnitPrices()).toEqual({});
    });

    it('excludes lines from draft invoices', async () => {
      await repo.saveInvoice({
        id: 'inv-draft',
        entityId: 'default',
        supplierId: null,
        invoiceNumber: 'INV-DRAFT',
        invoiceDate: null,
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l-draft', quantity: 5, totalVatExclude: 50, isVatable: true })],
      });
      expect(await repo.getLastUnitPrices()).toEqual({});
    });

    it('only considers the most recent purchase as of the given date', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-early',
        entityId: 'default',
        supplierId: null,
        invoiceNumber: 'INV-EARLY',
        invoiceDate: new Date('2026-01-01'),
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l-early', quantity: 10, totalVatExclude: 100, isVatable: true })],
      });
      await repo.saveAndPostInvoice({
        id: 'inv-late',
        entityId: 'default',
        supplierId: null,
        invoiceNumber: 'INV-LATE',
        invoiceDate: new Date('2026-06-01'),
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l-late', quantity: 10, totalVatExclude: 200, isVatable: true })],
      });

      const asOfEarly = await repo.getLastUnitPrices('2026-03-01');
      expect(asOfEarly['item-1']!.exclVat).toBe(10);

      const asOfLate = await repo.getLastUnitPrices('2026-12-01');
      expect(asOfLate['item-1']!.exclVat).toBe(20);
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

  describe('getLinesForAnalysis', () => {
    it('returns vatRate and isVatable from the parent invoice and line', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-1',
        entityId: 'default',
        supplierId: null,
        invoiceNumber: 'INV-001',
        invoiceDate: new Date('2025-01-15'),
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l-1', quantity: 2, totalVatExclude: 20, isVatable: true })],
      });
      const result = await repo.getLinesForAnalysis();
      expect(result).toHaveLength(1);
      expect(result[0]!.vatRate).toBe(15);
      expect(result[0]!.isVatable).toBe(true);
    });

    it('reflects isVatable: false when the line is not vatable', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-2',
        entityId: 'default',
        supplierId: null,
        invoiceNumber: 'INV-002',
        invoiceDate: new Date('2025-01-16'),
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l-2', quantity: 1, totalVatExclude: 10, isVatable: false })],
      });
      const result = await repo.getLinesForAnalysis();
      expect(result[0]!.isVatable).toBe(false);
    });

    it('excludes lines from draft invoices', async () => {
      await repo.saveInvoice({
        id: 'inv-draft',
        entityId: 'default',
        supplierId: null,
        invoiceNumber: 'INV-DRAFT',
        invoiceDate: new Date('2025-01-15'),
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l-draft', quantity: 1, totalVatExclude: 10, isVatable: true })],
      });
      const result = await repo.getLinesForAnalysis();
      expect(result).toHaveLength(0);
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

  describe('getCreditNotedQtyByInvoiceItem', () => {
    it('returns credited qty keyed by invoiceId::itemId across all invoices', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-8',
        entityId: 'default',
        invoiceNumber: 'INV-008',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'line-8', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });
      await repo.saveCreditNote({
        id: 'cn-8',
        sourceInvoiceId: 'inv-8',
        entityId: 'default',
        invoiceNumber: 'CN-INV-008',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'cn-line-8', itemId: 'item-1', quantity: 4, totalVatExclude: 40 })],
      });

      const result = await repo.getCreditNotedQtyByInvoiceItem();
      expect(result['inv-8::item-1']).toBe(4);
    });

    it('sums multiple credit notes against the same source invoice/item', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-9',
        entityId: 'default',
        invoiceNumber: 'INV-009',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'line-9', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });
      await repo.saveCreditNote({
        id: 'cn-9a',
        sourceInvoiceId: 'inv-9',
        entityId: 'default',
        invoiceNumber: 'CN-INV-009A',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'cn-line-9a', itemId: 'item-1', quantity: 3, totalVatExclude: 30 })],
      });
      await repo.saveCreditNote({
        id: 'cn-9b',
        sourceInvoiceId: 'inv-9',
        entityId: 'default',
        invoiceNumber: 'CN-INV-009B',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'cn-line-9b', itemId: 'item-1', quantity: 2, totalVatExclude: 20 })],
      });

      const result = await repo.getCreditNotedQtyByInvoiceItem();
      expect(result['inv-9::item-1']).toBe(5);
    });

    it('returns an empty object when no credit notes exist', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-10',
        entityId: 'default',
        invoiceNumber: 'INV-010',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'line-10', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });

      const result = await repo.getCreditNotedQtyByInvoiceItem();
      expect(result).toEqual({});
    });
  });

  describe('getPurchaseTotalsByItem', () => {
    it('sums qty and total value across posted invoices for each item', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-11',
        entityId: 'default',
        invoiceNumber: 'INV-011',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'line-11a', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });
      await repo.saveAndPostInvoice({
        id: 'inv-12',
        entityId: 'default',
        invoiceNumber: 'INV-012',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'line-12a', itemId: 'item-1', quantity: 5, totalVatExclude: 50 })],
      });

      const result = await repo.getPurchaseTotalsByItem();
      expect(result['item-1']).toEqual({ qty: 15, totalValue: 150 });
    });

    it('excludes draft invoices', async () => {
      await repo.saveInvoice({
        id: 'inv-13',
        entityId: 'default',
        invoiceNumber: 'INV-013',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'line-13a', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });

      const result = await repo.getPurchaseTotalsByItem();
      expect(result['item-1']).toBeUndefined();
    });

    it('filters by date range', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-14',
        entityId: 'default',
        invoiceNumber: 'INV-014',
        invoiceDate: new Date('2026-01-01'),
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'line-14a', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });
      await repo.saveAndPostInvoice({
        id: 'inv-15',
        entityId: 'default',
        invoiceNumber: 'INV-015',
        invoiceDate: new Date('2026-06-01'),
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'line-15a', itemId: 'item-1', quantity: 5, totalVatExclude: 50 })],
      });

      const result = await repo.getPurchaseTotalsByItem('2026-01-01', '2026-03-01');
      expect(result['item-1']).toEqual({ qty: 10, totalValue: 100 });
    });
  });

  describe('getCreditTotalsByItem', () => {
    it('sums qty and total value across credit notes for each item', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-16',
        entityId: 'default',
        invoiceNumber: 'INV-016',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'line-16a', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });
      await repo.saveCreditNote({
        id: 'cn-16',
        sourceInvoiceId: 'inv-16',
        entityId: 'default',
        invoiceNumber: 'CN-INV-016',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'cn-line-16', itemId: 'item-1', quantity: 3, totalVatExclude: 30 })],
      });

      const result = await repo.getCreditTotalsByItem();
      expect(result['item-1']).toEqual({ qty: 3, totalValue: 30 });
    });

    it('excludes posted (non-credit) invoices', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-17',
        entityId: 'default',
        invoiceNumber: 'INV-017',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'line-17a', itemId: 'item-2', quantity: 10, totalVatExclude: 100 })],
      });

      const result = await repo.getCreditTotalsByItem();
      expect(result['item-2']).toBeUndefined();
    });
  });

  describe('updatePostedInvoiceLines', () => {
    async function movementFor(invoiceId: string, itemId: string) {
      const rows = await db
        .select()
        .from(schema.stockMovements)
        .where(eq(schema.stockMovements.referenceId, invoiceId));
      return rows.find((r) => r.inventoryItemId === itemId) ?? null;
    }

    it('throws when the invoice is not posted', async () => {
      await repo.saveInvoice({
        id: 'inv-d1',
        entityId: 'default',
        invoiceNumber: 'INV-D1',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l1', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });

      await expect(
        repo.updatePostedInvoiceLines({
          id: 'inv-d1',
          lines: [line({ id: 'l1', itemId: 'item-1', quantity: 5, totalVatExclude: 50 })],
        }),
      ).rejects.toThrow('is not posted');
    });

    it('increases qty on the most recent purchase with no later movements', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-20',
        entityId: 'default',
        invoiceNumber: 'INV-020',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l20', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });

      await repo.updatePostedInvoiceLines({
        id: 'inv-20',
        lines: [line({ id: 'l20', itemId: 'item-1', quantity: 15, totalVatExclude: 150 })],
      });

      const movement = await movementFor('inv-20', 'item-1');
      expect(movement!.qty).toBe(15);
      expect(movement!.stockQtyAfter).toBe(15);
      expect(movement!.weightedAvgCostAfter).toBe(10);

      const invoice = await repo.getInvoiceById('inv-20');
      expect(invoice!.lines[0]!.quantity).toBe(15);
    });

    it('recalculates a later credit note downstream when the purchase qty changes', async () => {
      // occurredAt/createdAt are stored with second-level precision. Real credit
      // notes are always raised well after their source invoice is posted, so
      // pin the system clock a full second apart to make that ordering
      // deterministic here rather than relying on real elapsed time.
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
      await repo.saveAndPostInvoice({
        id: 'inv-21',
        entityId: 'default',
        invoiceNumber: 'INV-021',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l21', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });
      vi.setSystemTime(new Date('2026-01-01T00:00:01.000Z'));
      await repo.saveCreditNote({
        id: 'cn-21',
        sourceInvoiceId: 'inv-21',
        entityId: 'default',
        invoiceNumber: 'CN-INV-021',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'cn-l21', itemId: 'item-1', quantity: 3, totalVatExclude: 30 })],
      });
      vi.useRealTimers();

      await repo.updatePostedInvoiceLines({
        id: 'inv-21',
        lines: [line({ id: 'l21', itemId: 'item-1', quantity: 20, totalVatExclude: 200 })],
      });

      const anchor = await movementFor('inv-21', 'item-1');
      expect(anchor!.qty).toBe(20);
      expect(anchor!.stockQtyAfter).toBe(20);
      expect(anchor!.weightedAvgCostAfter).toBe(10);

      const creditMovement = await movementFor('cn-21', 'item-1');
      expect(creditMovement!.qty).toBe(-3);
      expect(creditMovement!.weightedAvgCostAfter).toBe(10);
      expect(creditMovement!.stockQtyAfter).toBe(17);
    });

    it('leaves an unrelated item entirely untouched', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-22',
        entityId: 'default',
        invoiceNumber: 'INV-022',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l22', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });
      await db.insert(schema.stockMovements).values({
        id: 'unrelated-mv',
        accountId: 'default',
        entityId: 'default',
        inventoryItemId: 'item-2',
        movementType: 'IN' as MovementType,
        qty: 5,
        unitCostAtTime: 3,
        totalCost: 15,
        weightedAvgCostAfter: 3,
        stockQtyAfter: 5,
        occurredAt: new Date(),
        createdAt: new Date(),
      });

      await repo.updatePostedInvoiceLines({
        id: 'inv-22',
        lines: [line({ id: 'l22', itemId: 'item-1', quantity: 8, totalVatExclude: 80 })],
      });

      const untouched = await db
        .select()
        .from(schema.stockMovements)
        .where(eq(schema.stockMovements.id, 'unrelated-mv'));
      expect(untouched[0]!.qty).toBe(5);
      expect(untouched[0]!.stockQtyAfter).toBe(5);
      expect(untouched[0]!.weightedAvgCostAfter).toBe(3);
    });

    it('rejects and rolls back an edit that would drive stock negative downstream', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-23',
        entityId: 'default',
        invoiceNumber: 'INV-023',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l23', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });
      await db.insert(schema.stockMovements).values({
        id: 'adj-23',
        accountId: 'default',
        entityId: 'default',
        inventoryItemId: 'item-1',
        movementType: 'ADJUSTMENT' as MovementType,
        qty: -9,
        weightedAvgCostAfter: 10,
        stockQtyAfter: 1,
        occurredAt: new Date(Date.now() + 60_000),
        createdAt: new Date(Date.now() + 60_000),
      });

      await expect(
        repo.updatePostedInvoiceLines({
          id: 'inv-23',
          lines: [line({ id: 'l23', itemId: 'item-1', quantity: 3, totalVatExclude: 30 })],
        }),
      ).rejects.toThrow('negative');

      const invoice = await repo.getInvoiceById('inv-23');
      expect(invoice!.lines[0]!.quantity).toBe(10);
      const adjustment = await db
        .select()
        .from(schema.stockMovements)
        .where(eq(schema.stockMovements.id, 'adj-23'));
      expect(adjustment[0]!.stockQtyAfter).toBe(1);
    });

    it('rejects and rolls back reducing qty below already-credited qty', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-24',
        entityId: 'default',
        invoiceNumber: 'INV-024',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l24', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });
      await repo.saveCreditNote({
        id: 'cn-24',
        sourceInvoiceId: 'inv-24',
        entityId: 'default',
        invoiceNumber: 'CN-INV-024',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'cn-l24', itemId: 'item-1', quantity: 6, totalVatExclude: 60 })],
      });

      await expect(
        repo.updatePostedInvoiceLines({
          id: 'inv-24',
          lines: [line({ id: 'l24', itemId: 'item-1', quantity: 5, totalVatExclude: 50 })],
        }),
      ).rejects.toThrow('already credited');

      const invoice = await repo.getInvoiceById('inv-24');
      expect(invoice!.lines[0]!.quantity).toBe(10);
    });

    it('adds a stock movement for an item newly added to the invoice', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-25',
        entityId: 'default',
        invoiceNumber: 'INV-025',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l25a', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });

      await repo.updatePostedInvoiceLines({
        id: 'inv-25',
        lines: [
          line({ id: 'l25a', itemId: 'item-1', quantity: 10, totalVatExclude: 100 }),
          line({ id: 'l25b', itemId: 'item-2', quantity: 4, totalVatExclude: 8, unitPrice: 2 }),
        ],
      });

      const movement = await movementFor('inv-25', 'item-2');
      expect(movement!.qty).toBe(4);
      expect(movement!.stockQtyAfter).toBe(4);
      expect(movement!.weightedAvgCostAfter).toBe(2);
    });

    it('removes the stock movement for an item dropped from the invoice', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-26',
        entityId: 'default',
        invoiceNumber: 'INV-026',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [
          line({ id: 'l26a', itemId: 'item-1', quantity: 10, totalVatExclude: 100 }),
          line({ id: 'l26b', itemId: 'item-2', quantity: 5, totalVatExclude: 50 }),
        ],
      });

      await repo.updatePostedInvoiceLines({
        id: 'inv-26',
        lines: [line({ id: 'l26a', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });

      const movement = await movementFor('inv-26', 'item-2');
      expect(movement).toBeNull();
      const invoice = await repo.getInvoiceById('inv-26');
      expect(invoice!.lines).toHaveLength(1);
    });

    it('writes an audit log entry with the pre-edit snapshot', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-27',
        entityId: 'default',
        invoiceNumber: 'INV-027',
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l27', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });

      await repo.updatePostedInvoiceLines({
        id: 'inv-27',
        note: 'Fixed a typo in the qty',
        lines: [line({ id: 'l27', itemId: 'item-1', quantity: 12, totalVatExclude: 120 })],
      });

      const audit = await repo.getInvoiceAudit('inv-27');
      expect(audit).toHaveLength(1);
      expect(audit[0]!.note).toBe('Fixed a typo in the qty');
      expect(audit[0]!.snapshot.lines[0]!.quantity).toBe(10);
    });

    it('re-sorts and re-replays WAC when the invoice date moves after a later purchase', async () => {
      await repo.saveAndPostInvoice({
        id: 'inv-28a',
        entityId: 'default',
        invoiceNumber: 'INV-028A',
        invoiceDate: new Date('2026-01-01'),
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [line({ id: 'l28a', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });
      await repo.saveAndPostInvoice({
        id: 'inv-28b',
        entityId: 'default',
        invoiceNumber: 'INV-028B',
        invoiceDate: new Date('2026-01-02'),
        vatMode: VatMode.Exclusive,
        vatRate: 15,
        lines: [
          line({ id: 'l28b', itemId: 'item-1', quantity: 10, totalVatExclude: 200, unitPrice: 20 }),
        ],
      });

      const beforeB = await movementFor('inv-28b', 'item-1');
      expect(beforeB!.weightedAvgCostAfter).toBe(15);

      await repo.updatePostedInvoiceLines({
        id: 'inv-28a',
        invoiceDate: new Date('2026-01-03'),
        lines: [line({ id: 'l28a', itemId: 'item-1', quantity: 10, totalVatExclude: 100 })],
      });

      const afterA = await movementFor('inv-28a', 'item-1');
      const afterB = await movementFor('inv-28b', 'item-1');
      expect(afterB!.weightedAvgCostAfter).toBe(20);
      expect(afterB!.stockQtyAfter).toBe(10);
      expect(afterA!.weightedAvgCostAfter).toBe(15);
      expect(afterA!.stockQtyAfter).toBe(20);
    });
  });
});

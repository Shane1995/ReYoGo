import { describe, it, expect, beforeEach } from 'vitest';
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
  totalVatExclude?: number;
  isVatable?: boolean;
  itemNameSnapshot?: string;
}) {
  return {
    id: overrides.id,
    itemId: overrides.itemId ?? 'item-1',
    itemNameSnapshot: overrides.itemNameSnapshot ?? '',
    quantity: overrides.quantity ?? 10,
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
    type: 'food',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await db.insert(schema.inventoryItems).values([
    {
      id: 'item-1',
      accountId: 'default',
      name: 'Flour',
      categoryId: 'cat-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'item-2',
      accountId: 'default',
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
        supplierId: null,
        invoiceDate: null,
        invoiceNumber: 'INV-001',
        vatMode: 'exclusive',
        vatRate: 15,
        lines: [line({ id: 'l-1', quantity: 10, totalVatExclude: 50 })],
      });
      const invoices = await db.select().from(schema.invoices);
      expect(invoices).toHaveLength(1);
      expect(invoices[0]!.invoiceNumber).toBe('INV-001');
      expect(await db.select().from(schema.invoiceLineItems)).toHaveLength(1);
    });

    it('creates a stock movement with correct WAC on first purchase', async () => {
      await repo.saveInvoice({
        id: 'inv-1',
        supplierId: null,
        invoiceDate: null,
        invoiceNumber: null,
        vatMode: 'exclusive',
        vatRate: 15,
        lines: [line({ id: 'l-1', quantity: 10, totalVatExclude: 100 })],
      });
      const movements = await db.select().from(schema.stockMovements);
      expect(movements).toHaveLength(1);
      expect(movements[0]!.unitCostAtTime).toBe(10);
      expect(movements[0]!.weightedAvgCostAfter).toBe(10);
      expect(movements[0]!.stockQtyAfter).toBe(10);
    });

    it('blends WAC correctly across two purchases', async () => {
      await repo.saveInvoice({
        id: 'inv-1',
        supplierId: null,
        invoiceNumber: null,
        invoiceDate: new Date('2024-01-01'),
        vatMode: 'exclusive',
        vatRate: 15,
        lines: [line({ id: 'l-1', quantity: 10, totalVatExclude: 100 })],
      });
      await repo.saveInvoice({
        id: 'inv-2',
        supplierId: null,
        invoiceNumber: null,
        invoiceDate: new Date('2024-01-02'),
        vatMode: 'exclusive',
        vatRate: 15,
        lines: [line({ id: 'l-2', quantity: 10, totalVatExclude: 200 })],
      });
      const movements = await db
        .select()
        .from(schema.stockMovements)
        .orderBy(schema.stockMovements.occurredAt);
      expect(movements[1]!.weightedAvgCostAfter).toBe(round4((10 * 10 + 10 * 20) / 20));
      expect(movements[1]!.stockQtyAfter).toBe(20);
    });

    it('skips lines with zero quantity', async () => {
      await repo.saveInvoice({
        id: 'inv-1',
        supplierId: null,
        invoiceDate: null,
        invoiceNumber: null,
        vatMode: 'exclusive',
        vatRate: 15,
        lines: [line({ id: 'l-1', quantity: 0, totalVatExclude: 0 })],
      });
      expect(await db.select().from(schema.stockMovements)).toHaveLength(0);
    });

    it('computes zero tax for non-vatable lines', async () => {
      await repo.saveInvoice({
        id: 'inv-1',
        supplierId: null,
        invoiceDate: null,
        invoiceNumber: null,
        vatMode: 'exclusive',
        vatRate: 15,
        lines: [line({ id: 'l-1', quantity: 10, totalVatExclude: 100, isVatable: false })],
      });
      const invoices = await db.select().from(schema.invoices);
      expect(invoices[0]!.taxAmount).toBe(0);
    });
  });

  describe('updateInvoice', () => {
    beforeEach(() =>
      repo.saveInvoice({
        id: 'inv-1',
        supplierId: null,
        invoiceNumber: 'INV-001',
        invoiceDate: new Date('2024-01-01'),
        vatMode: 'exclusive',
        vatRate: 15,
        lines: [line({ id: 'l-1', quantity: 10, totalVatExclude: 100 })],
      }),
    );

    it('replaces old movements with movements for the new lines', async () => {
      await repo.updateInvoice({
        id: 'inv-1',
        lines: [line({ id: 'l-2', itemId: 'item-2', quantity: 5, totalVatExclude: 50 })],
      });
      const movements = await db.select().from(schema.stockMovements);
      expect(movements).toHaveLength(1);
      expect(movements[0]!.inventoryItemId).toBe('item-2');
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
  });

  describe('getInvoices', () => {
    it('returns empty array when no invoices exist', async () => {
      expect(await repo.getInvoices()).toEqual([]);
    });

    it('returns all invoices ordered by createdAt descending', async () => {
      await repo.saveInvoice({
        id: 'inv-1',
        supplierId: null,
        invoiceNumber: null,
        invoiceDate: null,
        vatMode: 'exclusive',
        vatRate: 15,
        lines: [],
      });
      await repo.saveInvoice({
        id: 'inv-2',
        supplierId: null,
        invoiceNumber: null,
        invoiceDate: null,
        vatMode: 'exclusive',
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
        supplierId: null,
        invoiceNumber: 'INV-001',
        invoiceDate: null,
        vatMode: 'exclusive',
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
        supplierId: null,
        invoiceNumber: null,
        invoiceDate: null,
        vatMode: 'exclusive',
        vatRate: 15,
        lines: [line({ id: 'l-1', quantity: 10, totalVatExclude: 100 })],
      });
      expect((await repo.getLastUnitPrices())['item-1']).toBe(10);
    });

    it('returns empty object when no lines exist', async () => {
      expect(await repo.getLastUnitPrices()).toEqual({});
    });
  });
});

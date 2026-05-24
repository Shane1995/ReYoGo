import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type DbClient } from './helpers';
import { createInvoicesRepo } from '../repositories/invoices';
import * as schema from '../schema';

let db: DbClient;
let repo: ReturnType<typeof createInvoicesRepo>;

function round4(x: number) {
  return Math.round(x * 10000) / 10000;
}

beforeEach(async () => {
  db = await createTestDb();
  repo = createInvoicesRepo(db);
  await db
    .insert(schema.inventoryCategories)
    .values({
      id: 'cat-1',
      accountId: 'default',
      name: 'Ingredients',
      type: 'ingredient',
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
    it('creates invoice and line items', async () => {
      await repo.saveInvoice({
        id: 'inv-1',
        invoiceNumber: 'INV-001',
        lines: [
          {
            id: 'l-1',
            itemId: 'item-1',
            itemNameSnapshot: 'Flour',
            quantity: 10,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 50,
          },
        ],
      });
      const invoices = await db.select().from(schema.invoices);
      expect(invoices).toHaveLength(1);
      expect(invoices[0]!.invoiceNumber).toBe('INV-001');
      const lines = await db.select().from(schema.invoiceLineItems);
      expect(lines).toHaveLength(1);
    });

    it('creates stock movements with WAC', async () => {
      await repo.saveInvoice({
        id: 'inv-1',
        lines: [
          {
            id: 'l-1',
            itemId: 'item-1',
            itemNameSnapshot: 'Flour',
            quantity: 10,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 100,
          },
        ],
      });
      const movements = await db.select().from(schema.stockMovements);
      expect(movements).toHaveLength(1);
      expect(movements[0]!.unitCostAtTime).toBe(10);
      expect(movements[0]!.weightedAvgCostAfter).toBe(10);
      expect(movements[0]!.stockQtyAfter).toBe(10);
    });

    it('blends WAC across two invoices', async () => {
      await repo.saveInvoice({
        id: 'inv-1',
        invoiceDate: new Date('2024-01-01'),
        lines: [
          {
            id: 'l-1',
            itemId: 'item-1',
            itemNameSnapshot: 'Flour',
            quantity: 10,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 100,
          },
        ],
      });
      await repo.saveInvoice({
        id: 'inv-2',
        invoiceDate: new Date('2024-01-02'),
        lines: [
          {
            id: 'l-2',
            itemId: 'item-1',
            itemNameSnapshot: 'Flour',
            quantity: 10,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 200,
          },
        ],
      });
      const movements = await db
        .select()
        .from(schema.stockMovements)
        .orderBy(schema.stockMovements.occurredAt);
      expect(movements[1]!.weightedAvgCostAfter).toBe(round4((10 * 10 + 10 * 20) / 20));
      expect(movements[1]!.stockQtyAfter).toBe(20);
    });
  });

  describe('updateInvoice', () => {
    beforeEach(() =>
      repo.saveInvoice({
        id: 'inv-1',
        invoiceNumber: 'INV-001',
        invoiceDate: new Date('2024-01-01'),
        lines: [
          {
            id: 'l-1',
            itemId: 'item-1',
            itemNameSnapshot: 'Flour',
            quantity: 10,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 100,
          },
        ],
      }),
    );

    it('replaces movements with new lines', async () => {
      await repo.updateInvoice({
        id: 'inv-1',
        lines: [
          {
            id: 'l-2',
            itemId: 'item-2',
            itemNameSnapshot: 'Sugar',
            quantity: 5,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 50,
          },
        ],
      });
      const movements = await db.select().from(schema.stockMovements);
      expect(movements).toHaveLength(1);
      expect(movements[0]!.inventoryItemId).toBe('item-2');
    });

    it('creates audit log entry with previous snapshot', async () => {
      await repo.updateInvoice({ id: 'inv-1', note: 'Correction', lines: [] });
      const audit = await db.select().from(schema.invoiceAuditLog);
      expect(audit).toHaveLength(1);
      expect(audit[0]!.note).toBe('Correction');
      const snap = JSON.parse(audit[0]!.snapshot) as { id: string };
      expect(snap.id).toBe('inv-1');
    });
  });

  describe('getInvoices', () => {
    it('returns empty array when none exist', async () => {
      expect(await repo.getInvoices()).toEqual([]);
    });

    it('returns all invoices', async () => {
      await repo.saveInvoice({ id: 'inv-1', lines: [] });
      await repo.saveInvoice({ id: 'inv-2', lines: [] });
      expect(await repo.getInvoices()).toHaveLength(2);
    });
  });

  describe('getInvoiceById', () => {
    it('returns null for unknown id', async () => {
      expect(await repo.getInvoiceById('nope')).toBeNull();
    });

    it('returns invoice with lines', async () => {
      await repo.saveInvoice({
        id: 'inv-1',
        invoiceNumber: 'INV-001',
        lines: [
          {
            id: 'l-1',
            itemId: 'item-1',
            itemNameSnapshot: 'Flour',
            quantity: 10,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 100,
          },
        ],
      });
      const result = await repo.getInvoiceById('inv-1');
      expect(result!.invoiceNumber).toBe('INV-001');
      expect(result!.lines).toHaveLength(1);
    });
  });

  describe('getLastUnitPrices', () => {
    it('returns per-item unit price from most recent line', async () => {
      await repo.saveInvoice({
        id: 'inv-1',
        lines: [
          {
            id: 'l-1',
            itemId: 'item-1',
            itemNameSnapshot: 'Flour',
            quantity: 10,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 100,
          },
        ],
      });
      const prices = await repo.getLastUnitPrices();
      expect(prices['item-1']).toBe(10);
    });
  });
});

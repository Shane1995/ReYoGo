// @vitest-environment node
import { vi, beforeEach, describe, it, expect } from 'vitest';
import * as schema from '../../db/drizzle/schema';
import { createTestDb, type TestDb } from './helpers';

let db: TestDb;

vi.mock('../../db', () => ({ getDb: () => db, schema }));

import {
  saveInvoice,
  updateInvoice,
  getInvoices,
  getInvoiceById,
  getLastUnitPrices,
} from '../invoices';

function round4(x: number): number {
  return Math.round(x * 10000) / 10000;
}

beforeEach(async () => {
  db = await createTestDb();
  // Seed category + two items for all invoice tests
  db.insert(schema.inventoryCategories)
    .values({
      id: 'cat-1',
      accountId: 'default',
      name: 'Ingredients',
      type: 'ingredient',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .run();
  db.insert(schema.inventoryItems)
    .values([
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
    ])
    .run();
});

describe('invoices data access', () => {
  describe('saveInvoice', () => {
    it('creates invoice row and line items', async () => {
      await saveInvoice({
        id: 'inv-1',
        invoiceNumber: 'INV-001',
        lines: [
          {
            id: 'line-1',
            itemId: 'item-1',
            itemNameSnapshot: 'Flour',
            quantity: 10,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 50,
          },
        ],
      });

      const invoices = db.select().from(schema.invoices).all();
      expect(invoices).toHaveLength(1);
      const [inv] = invoices;
      expect(inv!.id).toBe('inv-1');
      expect(inv!.invoiceNumber).toBe('INV-001');

      const lines = db.select().from(schema.invoiceLineItems).all();
      expect(lines).toHaveLength(1);
      const [line] = lines;
      expect(line!.itemId).toBe('item-1');
      expect(line!.quantity).toBe(10);
      expect(line!.totalVatExclude).toBe(50);
    });

    it('creates stock movements for line items', async () => {
      await saveInvoice({
        id: 'inv-1',
        lines: [
          {
            id: 'line-1',
            itemId: 'item-1',
            itemNameSnapshot: 'Flour',
            quantity: 10,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 50,
          },
        ],
      });

      const movements = db.select().from(schema.stockMovements).all();
      expect(movements).toHaveLength(1);
      const [mov] = movements;
      expect(mov!.inventoryItemId).toBe('item-1');
      expect(mov!.movementType).toBe('IN');
      expect(mov!.qty).toBe(10);
      expect(mov!.referenceType).toBe('invoice');
      expect(mov!.referenceId).toBe('inv-1');
    });

    it('WAC zero-stock: first invoice uses unitCost directly', async () => {
      // item-1 has zero stock, so WAC = unitCostAtTime = totalVatExclude / qty
      await saveInvoice({
        id: 'inv-1',
        lines: [
          {
            id: 'line-1',
            itemId: 'item-1',
            itemNameSnapshot: 'Flour',
            quantity: 10,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 100, // unitCost = 100/10 = 10
          },
        ],
      });

      const movements = db.select().from(schema.stockMovements).all();
      expect(movements).toHaveLength(1);
      const [mov] = movements;
      expect(mov!.unitCostAtTime).toBe(10);
      expect(mov!.weightedAvgCostAfter).toBe(10);
      expect(mov!.stockQtyAfter).toBe(10);
    });

    it('WAC accumulation: two sequential invoices produce blended WAC', async () => {
      // First invoice: 10 units @ 10.00 each => WAC = 10.00
      await saveInvoice({
        id: 'inv-1',
        invoiceDate: new Date('2024-01-01T00:00:00Z'),
        lines: [
          {
            id: 'line-1',
            itemId: 'item-1',
            itemNameSnapshot: 'Flour',
            quantity: 10,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 100,
          },
        ],
      });

      // Second invoice: 10 units @ 20.00 each
      // WAC = (10 * 10 + 10 * 20) / (10 + 10) = 300 / 20 = 15.00
      await saveInvoice({
        id: 'inv-2',
        invoiceDate: new Date('2024-01-02T00:00:00Z'),
        lines: [
          {
            id: 'line-2',
            itemId: 'item-1',
            itemNameSnapshot: 'Flour',
            quantity: 10,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 200,
          },
        ],
      });

      const movements = db
        .select()
        .from(schema.stockMovements)
        .orderBy(schema.stockMovements.occurredAt)
        .all();

      expect(movements).toHaveLength(2);
      const [first, second] = movements;
      expect(first!.weightedAvgCostAfter).toBe(10);
      expect(first!.stockQtyAfter).toBe(10);

      const expectedWac = round4((10 * 10 + 10 * 20) / (10 + 10));
      expect(second!.weightedAvgCostAfter).toBe(expectedWac); // 15.0
      expect(second!.stockQtyAfter).toBe(20);
    });

    it('multi-line invoice: each item gets independent WAC movement', async () => {
      await saveInvoice({
        id: 'inv-1',
        lines: [
          {
            id: 'line-1',
            itemId: 'item-1',
            itemNameSnapshot: 'Flour',
            quantity: 10,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 100, // unitCost = 10
          },
          {
            id: 'line-2',
            itemId: 'item-2',
            itemNameSnapshot: 'Sugar',
            quantity: 5,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 25, // unitCost = 5
          },
        ],
      });

      const movements = db.select().from(schema.stockMovements).all();
      expect(movements).toHaveLength(2);

      const flourMov = movements.find((m) => m.inventoryItemId === 'item-1')!;
      const sugarMov = movements.find((m) => m.inventoryItemId === 'item-2')!;

      expect(flourMov).toBeDefined();
      expect(flourMov.unitCostAtTime).toBe(10);
      expect(flourMov.weightedAvgCostAfter).toBe(10);
      expect(flourMov.stockQtyAfter).toBe(10);

      expect(sugarMov).toBeDefined();
      expect(sugarMov.unitCostAtTime).toBe(5);
      expect(sugarMov.weightedAvgCostAfter).toBe(5);
      expect(sugarMov.stockQtyAfter).toBe(5);
    });
  });

  describe('updateInvoice', () => {
    beforeEach(async () => {
      // Seed an initial invoice to update
      await saveInvoice({
        id: 'inv-1',
        invoiceNumber: 'INV-001',
        invoiceDate: new Date('2024-01-01T00:00:00Z'),
        lines: [
          {
            id: 'line-1',
            itemId: 'item-1',
            itemNameSnapshot: 'Flour',
            quantity: 10,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 100,
          },
        ],
      });
    });

    it('deletes old movements and inserts new ones', async () => {
      const movsBefore = db.select().from(schema.stockMovements).all();
      expect(movsBefore).toHaveLength(1);

      await updateInvoice({
        id: 'inv-1',
        lines: [
          {
            id: 'line-2',
            itemId: 'item-2',
            itemNameSnapshot: 'Sugar',
            quantity: 5,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 50,
          },
        ],
      });

      const movsAfter = db.select().from(schema.stockMovements).all();
      // Old movement for item-1 removed, new for item-2
      expect(movsAfter).toHaveLength(1);
      const [mov] = movsAfter;
      expect(mov!.inventoryItemId).toBe('item-2');
      expect(mov!.referenceId).toBe('inv-1');
    });

    it('creates an audit log entry with the previous snapshot', async () => {
      await updateInvoice({
        id: 'inv-1',
        note: 'Corrected line items',
        lines: [
          {
            id: 'line-2',
            itemId: 'item-2',
            itemNameSnapshot: 'Sugar',
            quantity: 5,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 50,
          },
        ],
      });

      const auditRows = db.select().from(schema.invoiceAuditLog).all();
      expect(auditRows).toHaveLength(1);
      const [audit] = auditRows;
      expect(audit!.invoiceId).toBe('inv-1');
      expect(audit!.note).toBe('Corrected line items');

      const snapshot = JSON.parse(audit!.snapshot) as { id: string; lines: { itemId: string }[] };
      expect(snapshot.id).toBe('inv-1');
      // Snapshot should have the original lines
      expect(snapshot.lines).toHaveLength(1);
      const [snapLine] = snapshot.lines;
      expect(snapLine!.itemId).toBe('item-1');
    });

    it('updates the invoice updatedAt timestamp', async () => {
      const before = db.select().from(schema.invoices).all();
      const [invBefore] = before;
      expect(invBefore!.updatedAt).toBeNull();

      await updateInvoice({
        id: 'inv-1',
        lines: [
          {
            id: 'line-2',
            itemId: 'item-2',
            itemNameSnapshot: 'Sugar',
            quantity: 5,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 50,
          },
        ],
      });

      const after = db.select().from(schema.invoices).all();
      const [invAfter] = after;
      expect(invAfter!.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('getInvoices', () => {
    it('returns empty array when no invoices exist', async () => {
      const result = await getInvoices();
      expect(result).toEqual([]);
    });

    it('returns list of invoices', async () => {
      await saveInvoice({ id: 'inv-1', invoiceNumber: 'INV-001', lines: [] });
      await saveInvoice({ id: 'inv-2', invoiceNumber: 'INV-002', lines: [] });

      const result = await getInvoices();
      expect(result).toHaveLength(2);
      const ids = result.map((i) => i.id);
      expect(ids).toContain('inv-1');
      expect(ids).toContain('inv-2');
    });
  });

  describe('getInvoiceById', () => {
    it('returns null when invoice does not exist', async () => {
      const result = await getInvoiceById('non-existent');
      expect(result).toBeNull();
    });

    it('returns invoice with lines', async () => {
      await saveInvoice({
        id: 'inv-1',
        invoiceNumber: 'INV-001',
        lines: [
          {
            id: 'line-1',
            itemId: 'item-1',
            itemNameSnapshot: 'Flour',
            quantity: 10,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 100,
          },
        ],
      });

      const result = await getInvoiceById('inv-1');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('inv-1');
      expect(result!.invoiceNumber).toBe('INV-001');
      expect(result!.lines).toHaveLength(1);
      const [resultLine] = result!.lines;
      expect(resultLine!.itemId).toBe('item-1');
    });
  });

  describe('getLastUnitPrices', () => {
    it('returns empty object when no invoices exist', async () => {
      const result = await getLastUnitPrices();
      expect(result).toEqual({});
    });

    it('returns per-item unit price from most recent invoice line', async () => {
      // Seed inv-1 directly with an older createdAt so ordering is deterministic
      const oldDate = new Date('2024-01-01T00:00:00Z');
      db.insert(schema.invoices)
        .values({ id: 'inv-1', accountId: 'default', createdAt: oldDate })
        .run();
      db.insert(schema.invoiceLineItems)
        .values({
          id: 'line-1',
          invoiceId: 'inv-1',
          itemId: 'item-1',
          itemNameSnapshot: 'Flour',
          quantity: 10,
          vatMode: 'exclusive',
          vatRate: 0,
          totalVatExclude: 100, // 10/unit
        })
        .run();

      // Second (more recent) invoice created via saveInvoice → gets a current timestamp
      await saveInvoice({
        id: 'inv-2',
        lines: [
          {
            id: 'line-2',
            itemId: 'item-1',
            itemNameSnapshot: 'Flour',
            quantity: 10,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 200, // 20/unit
          },
        ],
      });

      const result = await getLastUnitPrices();
      // Should return price from the most recent invoice (inv-2): 200/10 = 20
      expect(result['item-1']).toBe(20);
    });

    it('returns independent prices for different items', async () => {
      await saveInvoice({
        id: 'inv-1',
        lines: [
          {
            id: 'line-1',
            itemId: 'item-1',
            itemNameSnapshot: 'Flour',
            quantity: 10,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 100, // 10/unit
          },
          {
            id: 'line-2',
            itemId: 'item-2',
            itemNameSnapshot: 'Sugar',
            quantity: 5,
            vatMode: 'exclusive',
            vatRate: 0,
            totalVatExclude: 30, // 6/unit
          },
        ],
      });

      const result = await getLastUnitPrices();
      expect(result['item-1']).toBe(10);
      expect(result['item-2']).toBe(6);
    });
  });
});

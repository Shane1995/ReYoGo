import { describe, it, expect, beforeEach } from 'vitest';
import { InventoryType, InvoiceStatus, MovementType, ReferenceType, VatMode } from '@reyogo/types';
import { createTestDb, type DbClient } from '../../__tests__/helpers';
import { createStockMovementsRepo } from '.';
import * as schema from '../../schema';

let db: DbClient;
let repo: ReturnType<typeof createStockMovementsRepo>;

async function seedCategory(db: DbClient) {
  await db.insert(schema.inventoryCategories).values({
    id: 'cat-1',
    accountId: 'default',
    name: 'Food',
    type: InventoryType.Food,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

async function seedItem(db: DbClient, itemId: string, name = 'Item') {
  await db.insert(schema.inventoryItems).values({
    id: itemId,
    entityId: 'default',
    name,
    categoryId: 'cat-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

async function seedMovement(
  db: DbClient,
  opts: {
    id: string;
    itemId: string;
    type?: MovementType;
    qty: number;
    unitCost?: number;
    wac?: number;
    stockAfter: number;
    occurredAt?: Date;
    referenceType?: ReferenceType;
    referenceId?: string;
    notes?: string;
  },
) {
  const t = opts.occurredAt ?? new Date();
  await db.insert(schema.stockMovements).values({
    id: opts.id,
    accountId: 'default',
    entityId: 'default',
    inventoryItemId: opts.itemId,
    movementType: opts.type ?? MovementType.In,
    qty: opts.qty,
    unitCostAtTime: opts.unitCost ?? null,
    weightedAvgCostAfter: opts.wac ?? null,
    stockQtyAfter: opts.stockAfter,
    referenceType: opts.referenceType ?? null,
    referenceId: opts.referenceId ?? null,
    notes: opts.notes ?? null,
    occurredAt: t,
    createdAt: t,
  });
}

async function seedInvoice(db: DbClient, id: string, invoiceNumber: string, status: InvoiceStatus) {
  await db.insert(schema.invoices).values({
    id,
    accountId: 'default',
    entityId: 'default',
    invoiceNumber,
    status,
    vatMode: VatMode.Exclusive,
    vatRate: 15,
    createdAt: new Date(),
  });
}

beforeEach(async () => {
  db = await createTestDb();
  repo = createStockMovementsRepo(db);
  await seedCategory(db);
});

describe('createStockMovementsRepo', () => {
  describe('getCurrentStockByItem', () => {
    it('returns empty object when no movements exist', async () => {
      expect(await repo.getCurrentStockByItem()).toEqual({});
    });

    it('returns the last stockQtyAfter per item', async () => {
      await seedItem(db, 'item-1');
      await seedMovement(db, {
        id: 'mv-1',
        itemId: 'item-1',
        qty: 10,
        stockAfter: 10,
        occurredAt: new Date('2024-01-01'),
      });
      await seedMovement(db, {
        id: 'mv-2',
        itemId: 'item-1',
        qty: 5,
        stockAfter: 15,
        occurredAt: new Date('2024-01-02'),
      });
      expect((await repo.getCurrentStockByItem())['item-1']).toBe(15);
    });

    it('tracks multiple items independently', async () => {
      await seedItem(db, 'item-1', 'Lager');
      await seedItem(db, 'item-2', 'Bitter');
      await seedMovement(db, { id: 'mv-1', itemId: 'item-1', qty: 4, stockAfter: 4 });
      await seedMovement(db, { id: 'mv-2', itemId: 'item-2', qty: 2, stockAfter: 2 });
      const stock = await repo.getCurrentStockByItem();
      expect(stock['item-1']).toBe(4);
      expect(stock['item-2']).toBe(2);
    });

    it('per-entity: returns stock for that entity only', async () => {
      await seedItem(db, 'item-1');
      await db.insert(schema.entities).values({
        id: 'entity-2',
        groupId: 'default-group',
        name: 'Entity 2',
        createdAt: new Date(),
      });
      await seedMovement(db, {
        id: 'mv-entity-a',
        itemId: 'item-1',
        qty: 10,
        stockAfter: 10,
        occurredAt: new Date('2024-01-01'),
      });
      await db.insert(schema.stockMovements).values({
        id: 'mv-entity-b',
        accountId: 'default',
        entityId: 'entity-2',
        inventoryItemId: 'item-1',
        movementType: MovementType.In,
        qty: 5,
        stockQtyAfter: 5,
        occurredAt: new Date('2024-01-02'),
        createdAt: new Date(),
      });
      expect((await repo.getCurrentStockByItem('default'))['item-1']).toBe(10);
    });

    it('asOfDate: ignores movements after the given date', async () => {
      await seedItem(db, 'item-1');
      await seedMovement(db, {
        id: 'mv-1',
        itemId: 'item-1',
        qty: 10,
        stockAfter: 10,
        occurredAt: new Date('2024-01-01'),
      });
      await seedMovement(db, {
        id: 'mv-2',
        itemId: 'item-1',
        qty: 5,
        stockAfter: 15,
        occurredAt: new Date('2024-01-10'),
      });
      expect((await repo.getCurrentStockByItem(undefined, '2024-01-05'))['item-1']).toBe(10);
    });

    it('asOfDate: includes movements on the given date', async () => {
      await seedItem(db, 'item-1');
      await seedMovement(db, {
        id: 'mv-1',
        itemId: 'item-1',
        qty: 10,
        stockAfter: 10,
        occurredAt: new Date('2024-01-05'),
      });
      expect((await repo.getCurrentStockByItem(undefined, '2024-01-05'))['item-1']).toBe(10);
    });

    it('aggregate (no entityId): sums latest stock across entities', async () => {
      await seedItem(db, 'item-1');
      await db.insert(schema.entities).values({
        id: 'entity-2',
        groupId: 'default-group',
        name: 'Entity 2',
        createdAt: new Date(),
      });
      await seedMovement(db, {
        id: 'mv-a',
        itemId: 'item-1',
        qty: 10,
        stockAfter: 10,
        occurredAt: new Date('2024-01-01'),
      });
      await db.insert(schema.stockMovements).values({
        id: 'mv-b',
        accountId: 'default',
        entityId: 'entity-2',
        inventoryItemId: 'item-1',
        movementType: MovementType.In,
        qty: 5,
        stockQtyAfter: 5,
        occurredAt: new Date('2024-01-02'),
        createdAt: new Date(),
      });
      expect((await repo.getCurrentStockByItem())['item-1']).toBe(15);
    });
  });

  describe('getWeightedAvgCosts', () => {
    it('returns empty object when no movements exist', async () => {
      expect(await repo.getWeightedAvgCosts()).toEqual({});
    });

    it('returns WAC from the latest IN movement', async () => {
      await seedItem(db, 'item-1');
      await seedMovement(db, {
        id: 'mv-1',
        itemId: 'item-1',
        qty: 10,
        wac: 5.0,
        stockAfter: 10,
        occurredAt: new Date('2024-01-01'),
      });
      await seedMovement(db, {
        id: 'mv-2',
        itemId: 'item-1',
        qty: 10,
        wac: 6.0,
        stockAfter: 20,
        occurredAt: new Date('2024-01-02'),
      });
      expect((await repo.getWeightedAvgCosts())['item-1']).toBe(6.0);
    });

    it('asOfDate: returns WAC as of the given date, ignoring later movements', async () => {
      await seedItem(db, 'item-1');
      await seedMovement(db, {
        id: 'mv-1',
        itemId: 'item-1',
        qty: 10,
        wac: 5.0,
        stockAfter: 10,
        occurredAt: new Date('2024-01-01'),
      });
      await seedMovement(db, {
        id: 'mv-2',
        itemId: 'item-1',
        qty: 10,
        wac: 6.0,
        stockAfter: 20,
        occurredAt: new Date('2024-01-10'),
      });
      expect((await repo.getWeightedAvgCosts(undefined, '2024-01-05'))['item-1']).toBe(5.0);
    });
  });

  describe('getMovementsForItem', () => {
    it('returns empty array when no movements exist', async () => {
      expect(await repo.getMovementsForItem('item-1')).toEqual([]);
    });

    it('returns movements for the given item in descending date order', async () => {
      await seedItem(db, 'item-1');
      await seedMovement(db, {
        id: 'mv-1',
        itemId: 'item-1',
        qty: 10,
        stockAfter: 10,
        occurredAt: new Date('2024-01-01'),
      });
      await seedMovement(db, {
        id: 'mv-2',
        itemId: 'item-1',
        qty: 5,
        stockAfter: 15,
        occurredAt: new Date('2024-01-02'),
      });
      const movements = await repo.getMovementsForItem('item-1');
      expect(movements).toHaveLength(2);
      expect(movements[0]!.id).toBe('mv-2');
      expect(movements[1]!.id).toBe('mv-1');
    });

    it('excludes movements for other items', async () => {
      await seedItem(db, 'item-1', 'Lager');
      await seedItem(db, 'item-2', 'Bitter');
      await seedMovement(db, { id: 'mv-1', itemId: 'item-1', qty: 10, stockAfter: 10 });
      await seedMovement(db, { id: 'mv-2', itemId: 'item-2', qty: 5, stockAfter: 5 });
      expect(await repo.getMovementsForItem('item-1')).toHaveLength(1);
    });
  });

  describe('getMovementsForItemWithLabels', () => {
    it('labels an invoice-referenced movement with the invoice number', async () => {
      await seedItem(db, 'item-1');
      await seedInvoice(db, 'inv-1', 'INV-001', InvoiceStatus.Posted);
      await seedMovement(db, {
        id: 'mv-1',
        itemId: 'item-1',
        qty: 10,
        stockAfter: 10,
        referenceType: ReferenceType.Invoice,
        referenceId: 'inv-1',
      });
      const movements = await repo.getMovementsForItemWithLabels('item-1');
      expect(movements[0]!.referenceLabel).toBe('INV-001');
    });

    it('labels a credit-note-referenced movement with the credit note number', async () => {
      await seedItem(db, 'item-1');
      await seedInvoice(db, 'cn-1', 'CN-INV-001', InvoiceStatus.CreditNote);
      await seedMovement(db, {
        id: 'mv-1',
        itemId: 'item-1',
        type: MovementType.Return,
        qty: -2,
        stockAfter: 8,
        referenceType: ReferenceType.CreditNote,
        referenceId: 'cn-1',
      });
      const movements = await repo.getMovementsForItemWithLabels('item-1');
      expect(movements[0]!.referenceLabel).toBe('CN-INV-001');
    });

    it('labels a non-invoice movement with its notes', async () => {
      await seedItem(db, 'item-1');
      await seedMovement(db, {
        id: 'mv-1',
        itemId: 'item-1',
        type: MovementType.Adjustment,
        qty: 3,
        stockAfter: 3,
        referenceType: ReferenceType.Adjustment,
        referenceId: 'session-1',
        notes: 'Stock count variance',
      });
      const movements = await repo.getMovementsForItemWithLabels('item-1');
      expect(movements[0]!.referenceLabel).toBe('Stock count variance');
    });

    it('returns a null label when there is no reference or notes', async () => {
      await seedItem(db, 'item-1');
      await seedMovement(db, { id: 'mv-1', itemId: 'item-1', qty: 10, stockAfter: 10 });
      const movements = await repo.getMovementsForItemWithLabels('item-1');
      expect(movements[0]!.referenceLabel).toBeNull();
    });
  });

  describe('getItemCostHistory', () => {
    it('returns zero stock and null WAC when no movements exist', async () => {
      const history = await repo.getItemCostHistory('item-1');
      expect(history.totalStock).toBe(0);
      expect(history.weightedAvgCost).toBeNull();
      expect(history.movements).toEqual([]);
    });

    it('returns current stock and latest WAC', async () => {
      await seedItem(db, 'item-1');
      await seedMovement(db, { id: 'mv-1', itemId: 'item-1', qty: 10, wac: 5.0, stockAfter: 10 });
      const history = await repo.getItemCostHistory('item-1');
      expect(history.totalStock).toBe(10);
      expect(history.weightedAvgCost).toBe(5.0);
      expect(history.movements).toHaveLength(1);
    });
  });

  describe('getCOGS', () => {
    it('returns zero total when no movements exist', async () => {
      const result = await repo.getCOGS();
      expect(result.total).toBe(0);
      expect(result.byCategory).toEqual([]);
    });

    it('sums OUT movements by qty × unitCostAtTime', async () => {
      await seedItem(db, 'item-1');
      await seedMovement(db, {
        id: 'mv-1',
        itemId: 'item-1',
        type: MovementType.Out,
        qty: 5,
        unitCost: 10,
        stockAfter: 5,
      });
      expect((await repo.getCOGS()).total).toBe(50);
    });

    it('excludes IN movements from the total', async () => {
      await seedItem(db, 'item-1');
      await seedMovement(db, {
        id: 'mv-1',
        itemId: 'item-1',
        type: MovementType.In,
        qty: 10,
        unitCost: 10,
        stockAfter: 10,
      });
      expect((await repo.getCOGS()).total).toBe(0);
    });

    it('filters by fromDate', async () => {
      await seedItem(db, 'item-1');
      await seedMovement(db, {
        id: 'mv-1',
        itemId: 'item-1',
        type: MovementType.Out,
        qty: 5,
        unitCost: 10,
        stockAfter: 5,
        occurredAt: new Date('2024-01-01'),
      });
      await seedMovement(db, {
        id: 'mv-2',
        itemId: 'item-1',
        type: MovementType.Out,
        qty: 5,
        unitCost: 10,
        stockAfter: 0,
        occurredAt: new Date('2024-02-01'),
      });
      const result = await repo.getCOGS('2024-02-01');
      expect(result.total).toBe(50);
    });

    it('filters by toDate', async () => {
      await seedItem(db, 'item-1');
      await seedMovement(db, {
        id: 'mv-1',
        itemId: 'item-1',
        type: MovementType.Out,
        qty: 5,
        unitCost: 10,
        stockAfter: 5,
        occurredAt: new Date('2024-01-01'),
      });
      await seedMovement(db, {
        id: 'mv-2',
        itemId: 'item-1',
        type: MovementType.Out,
        qty: 5,
        unitCost: 10,
        stockAfter: 0,
        occurredAt: new Date('2024-02-01'),
      });
      const result = await repo.getCOGS(undefined, '2024-01-31');
      expect(result.total).toBe(50);
    });

    it('groups results by category', async () => {
      await seedItem(db, 'item-1');
      await seedMovement(db, {
        id: 'mv-1',
        itemId: 'item-1',
        type: MovementType.Out,
        qty: 2,
        unitCost: 5,
        stockAfter: 8,
      });
      const result = await repo.getCOGS();
      expect(result.byCategory).toHaveLength(1);
      expect(result.byCategory[0]!.categoryName).toBe('Food');
      expect(result.byCategory[0]!.total).toBe(10);
    });
  });
});

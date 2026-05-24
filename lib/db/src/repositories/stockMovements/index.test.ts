import { describe, it, expect, beforeEach } from 'vitest';
import type { StockMovementType } from '@reyogo/types';
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
    type: 'food',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

async function seedItem(db: DbClient, itemId: string, name = 'Item') {
  await db.insert(schema.inventoryItems).values({
    id: itemId,
    accountId: 'default',
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
    type?: StockMovementType;
    qty: number;
    unitCost?: number;
    wac?: number;
    stockAfter: number;
    occurredAt?: Date;
  },
) {
  const t = opts.occurredAt ?? new Date();
  await db.insert(schema.stockMovements).values({
    id: opts.id,
    accountId: 'default',
    inventoryItemId: opts.itemId,
    movementType: opts.type ?? 'IN',
    qty: opts.qty,
    unitCostAtTime: opts.unitCost ?? null,
    weightedAvgCostAfter: opts.wac ?? null,
    stockQtyAfter: opts.stockAfter,
    occurredAt: t,
    createdAt: t,
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
        type: 'OUT',
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
        type: 'IN',
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
        type: 'OUT',
        qty: 5,
        unitCost: 10,
        stockAfter: 5,
        occurredAt: new Date('2024-01-01'),
      });
      await seedMovement(db, {
        id: 'mv-2',
        itemId: 'item-1',
        type: 'OUT',
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
        type: 'OUT',
        qty: 5,
        unitCost: 10,
        stockAfter: 5,
        occurredAt: new Date('2024-01-01'),
      });
      await seedMovement(db, {
        id: 'mv-2',
        itemId: 'item-1',
        type: 'OUT',
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
        type: 'OUT',
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

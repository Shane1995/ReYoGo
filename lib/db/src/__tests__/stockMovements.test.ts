import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type DbClient } from './helpers';
import { createStockMovementsRepo } from '../repositories/stockMovements';
import * as schema from '../schema';

let db: DbClient;
let repo: ReturnType<typeof createStockMovementsRepo>;

async function seedItem(db: DbClient, itemId: string, name = 'Item') {
  await db.insert(schema.inventoryCategories).values({
    id: 'cat-1',
    accountId: 'default',
    name: 'Cat',
    type: 'ingredient',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await db.insert(schema.inventoryItems).values({
    id: itemId,
    accountId: 'default',
    name,
    categoryId: 'cat-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

beforeEach(async () => {
  db = await createTestDb();
  repo = createStockMovementsRepo(db);
});

describe('createStockMovementsRepo', () => {
  describe('getCurrentStockByItem', () => {
    it('returns empty object when no movements', async () => {
      expect(await repo.getCurrentStockByItem()).toEqual({});
    });

    it('returns last stockQtyAfter per item', async () => {
      await seedItem(db, 'item-1');
      const t1 = new Date('2024-01-01T10:00:00Z');
      const t2 = new Date('2024-01-02T10:00:00Z');
      await db.insert(schema.stockMovements).values([
        {
          id: 'mv-1',
          accountId: 'default',
          inventoryItemId: 'item-1',
          movementType: 'IN',
          qty: 10,
          stockQtyAfter: 10,
          occurredAt: t1,
          createdAt: t1,
        },
        {
          id: 'mv-2',
          accountId: 'default',
          inventoryItemId: 'item-1',
          movementType: 'IN',
          qty: 5,
          stockQtyAfter: 15,
          occurredAt: t2,
          createdAt: t2,
        },
      ]);
      expect((await repo.getCurrentStockByItem())['item-1']).toBe(15);
    });
  });

  describe('getWeightedAvgCosts', () => {
    it('returns empty object when no movements', async () => {
      expect(await repo.getWeightedAvgCosts()).toEqual({});
    });

    it('returns WAC from latest IN movement', async () => {
      await seedItem(db, 'item-1');
      const t1 = new Date('2024-01-01T10:00:00Z');
      const t2 = new Date('2024-01-02T10:00:00Z');
      await db.insert(schema.stockMovements).values([
        {
          id: 'mv-1',
          accountId: 'default',
          inventoryItemId: 'item-1',
          movementType: 'IN',
          qty: 10,
          weightedAvgCostAfter: 5.0,
          stockQtyAfter: 10,
          occurredAt: t1,
          createdAt: t1,
        },
        {
          id: 'mv-2',
          accountId: 'default',
          inventoryItemId: 'item-1',
          movementType: 'IN',
          qty: 10,
          weightedAvgCostAfter: 6.0,
          stockQtyAfter: 20,
          occurredAt: t2,
          createdAt: t2,
        },
      ]);
      expect((await repo.getWeightedAvgCosts())['item-1']).toBe(6.0);
    });
  });

  describe('getCOGS', () => {
    it('returns zero total with empty movements', async () => {
      const result = await repo.getCOGS();
      expect(result.total).toBe(0);
      expect(result.byCategory).toEqual([]);
    });

    it('sums OUT movements by qty * unitCostAtTime', async () => {
      await seedItem(db, 'item-1');
      const t = new Date('2024-01-01T10:00:00Z');
      await db
        .insert(schema.stockMovements)
        .values([
          {
            id: 'mv-1',
            accountId: 'default',
            inventoryItemId: 'item-1',
            movementType: 'OUT',
            qty: 5,
            unitCostAtTime: 10,
            stockQtyAfter: 5,
            occurredAt: t,
            createdAt: t,
          },
        ]);
      const result = await repo.getCOGS();
      expect(result.total).toBe(50);
    });
  });
});

// @vitest-environment node
import { vi, beforeEach, describe, it, expect } from 'vitest';
import * as schema from '../../db/drizzle/schema';
import { createTestDb, type TestDb } from './helpers';

let db: TestDb;

vi.mock('../../db', () => ({ getDb: () => db, schema }));

import { getCurrentStockByItem, getWeightedAvgCosts } from '../stockMovements';

beforeEach(async () => {
  db = await createTestDb();
});

// Helper to seed prerequisite category + item
function seedCategoryAndItem(itemId: string, itemName = 'Test Item') {
  db.insert(schema.inventoryCategories)
    .values({
      id: 'cat-1',
      accountId: 'default',
      name: 'Test Cat',
      type: 'ingredient',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .run();
  db.insert(schema.inventoryItems)
    .values({
      id: itemId,
      accountId: 'default',
      name: itemName,
      categoryId: 'cat-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .run();
}

describe('stockMovements data access', () => {
  describe('getCurrentStockByItem', () => {
    it('returns empty object when no movements exist', async () => {
      const result = await getCurrentStockByItem();
      expect(result).toEqual({});
    });

    it('returns the last stockQtyAfter per item', async () => {
      seedCategoryAndItem('item-1');
      const t1 = new Date('2024-01-01T10:00:00Z');
      const t2 = new Date('2024-01-02T10:00:00Z');

      db.insert(schema.stockMovements)
        .values([
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
        ])
        .run();

      const result = await getCurrentStockByItem();
      expect(result['item-1']).toBe(15);
    });

    it('returns independent stock quantities per item', async () => {
      seedCategoryAndItem('item-1', 'Item One');
      db.insert(schema.inventoryItems)
        .values({
          id: 'item-2',
          accountId: 'default',
          name: 'Item Two',
          categoryId: 'cat-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .run();

      const t1 = new Date('2024-01-01T10:00:00Z');
      db.insert(schema.stockMovements)
        .values([
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
            inventoryItemId: 'item-2',
            movementType: 'IN',
            qty: 20,
            stockQtyAfter: 20,
            occurredAt: t1,
            createdAt: t1,
          },
        ])
        .run();

      const result = await getCurrentStockByItem();
      expect(result['item-1']).toBe(10);
      expect(result['item-2']).toBe(20);
    });
  });

  describe('getWeightedAvgCosts', () => {
    it('returns empty object when no movements exist', async () => {
      const result = await getWeightedAvgCosts();
      expect(result).toEqual({});
    });

    it('returns WAC from latest IN movement per item', async () => {
      seedCategoryAndItem('item-1');
      const t1 = new Date('2024-01-01T10:00:00Z');
      const t2 = new Date('2024-01-02T10:00:00Z');

      db.insert(schema.stockMovements)
        .values([
          {
            id: 'mv-1',
            accountId: 'default',
            inventoryItemId: 'item-1',
            movementType: 'IN',
            qty: 10,
            unitCostAtTime: 5.0,
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
            unitCostAtTime: 7.0,
            weightedAvgCostAfter: 6.0,
            stockQtyAfter: 20,
            occurredAt: t2,
            createdAt: t2,
          },
        ])
        .run();

      const result = await getWeightedAvgCosts();
      // Should return the latest WAC (from t2)
      expect(result['item-1']).toBe(6.0);
    });

    it('only considers IN movements, not OUT', async () => {
      seedCategoryAndItem('item-1');
      const t1 = new Date('2024-01-01T10:00:00Z');
      const t2 = new Date('2024-01-02T10:00:00Z');

      db.insert(schema.stockMovements)
        .values([
          {
            id: 'mv-1',
            accountId: 'default',
            inventoryItemId: 'item-1',
            movementType: 'IN',
            qty: 10,
            unitCostAtTime: 5.0,
            weightedAvgCostAfter: 5.0,
            stockQtyAfter: 10,
            occurredAt: t1,
            createdAt: t1,
          },
          {
            id: 'mv-2',
            accountId: 'default',
            inventoryItemId: 'item-1',
            movementType: 'OUT',
            qty: 3,
            stockQtyAfter: 7,
            occurredAt: t2,
            createdAt: t2,
          },
        ])
        .run();

      const result = await getWeightedAvgCosts();
      // OUT movements should not be included; still returns WAC from IN
      expect(result['item-1']).toBe(5.0);
    });
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type DbClient } from './helpers';
import { createInventoryRepo } from '../repositories/inventory';
import * as schema from '../schema';

let db: DbClient;
let repo: ReturnType<typeof createInventoryRepo>;

beforeEach(async () => {
  db = await createTestDb();
  repo = createInventoryRepo(db);
});

describe('createInventoryRepo', () => {
  describe('upsertCategory', () => {
    it('creates a new category', async () => {
      await repo.upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'ingredient' });
      const rows = await db.select().from(schema.inventoryCategories);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Beverages');
    });

    it('updates an existing category', async () => {
      await repo.upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'ingredient' });
      await repo.upsertCategory({ id: 'cat-1', name: 'Drinks', type: 'finished_good' });
      const rows = await db.select().from(schema.inventoryCategories);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Drinks');
    });
  });

  describe('getCategories', () => {
    it('returns categories sorted by name', async () => {
      await repo.upsertCategory({ id: 'cat-2', name: 'Produce', type: 'ingredient' });
      await repo.upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'ingredient' });
      const cats = await repo.getCategories();
      expect(cats.map((c) => c.name)).toEqual(['Beverages', 'Produce']);
    });

    it('returns empty array when no categories', async () => {
      expect(await repo.getCategories()).toEqual([]);
    });
  });

  describe('upsertItem', () => {
    beforeEach(() => repo.upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'ingredient' }));

    it('creates a new item', async () => {
      await repo.upsertItem({
        id: 'item-1',
        name: 'OJ',
        categoryId: 'cat-1',
        type: 'ingredient',
        unitOfMeasure: 'L',
      });
      const rows = await db.select().from(schema.inventoryItems);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.unitOfMeasure).toBe('L');
    });

    it('updates an existing item', async () => {
      await repo.upsertItem({ id: 'item-1', name: 'OJ', categoryId: 'cat-1', type: 'ingredient' });
      await repo.upsertItem({
        id: 'item-1',
        name: 'Apple Juice',
        categoryId: 'cat-1',
        type: 'ingredient',
      });
      const rows = await db.select().from(schema.inventoryItems);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Apple Juice');
    });
  });

  describe('getItems', () => {
    it('returns items sorted by name with category type', async () => {
      await repo.upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'ingredient' });
      await repo.upsertItem({ id: 'item-1', name: 'OJ', categoryId: 'cat-1', type: 'ingredient' });
      const items = await repo.getItems();
      expect(items).toHaveLength(1);
      expect(items[0]!.type).toBe('ingredient');
    });
  });

  describe('deleteCategory', () => {
    it('removes a category', async () => {
      await repo.upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'ingredient' });
      await repo.deleteCategory('cat-1');
      expect(await db.select().from(schema.inventoryCategories)).toHaveLength(0);
    });
  });

  describe('deleteItem', () => {
    it('removes an item', async () => {
      await repo.upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'ingredient' });
      await repo.upsertItem({ id: 'item-1', name: 'OJ', categoryId: 'cat-1', type: 'ingredient' });
      await repo.deleteItem('item-1');
      expect(await db.select().from(schema.inventoryItems)).toHaveLength(0);
    });
  });
});

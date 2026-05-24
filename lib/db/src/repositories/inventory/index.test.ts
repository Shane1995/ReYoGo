import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, type DbClient } from '../../__tests__/helpers';
import { createInventoryRepo } from '.';
import * as schema from '../../schema';

let db: DbClient;
let repo: ReturnType<typeof createInventoryRepo>;

beforeEach(async () => {
  db = await createTestDb();
  repo = createInventoryRepo(db);
});

describe('createInventoryRepo', () => {
  describe('upsertCategory', () => {
    it('creates a new category', async () => {
      await repo.upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'beverage' });
      const rows = await db.select().from(schema.inventoryCategories);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Beverages');
    });

    it('updates an existing category', async () => {
      await repo.upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'beverage' });
      await repo.upsertCategory({ id: 'cat-1', name: 'Drinks', type: 'beverage' });
      const rows = await db.select().from(schema.inventoryCategories);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Drinks');
    });
  });

  describe('getCategories', () => {
    it('returns categories sorted by name', async () => {
      await repo.upsertCategory({ id: 'cat-2', name: 'Produce', type: 'food' });
      await repo.upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'beverage' });
      const cats = await repo.getCategories();
      expect(cats.map((c) => c.name)).toEqual(['Beverages', 'Produce']);
    });

    it('returns empty array when no categories exist', async () => {
      expect(await repo.getCategories()).toEqual([]);
    });
  });

  describe('upsertItem', () => {
    beforeEach(() => repo.upsertCategory({ id: 'cat-1', name: 'Food', type: 'food' }));

    it('creates a new item', async () => {
      await repo.upsertItem({
        id: 'item-1',
        name: 'Chips',
        categoryId: 'cat-1',
        type: 'food',
        unitOfMeasure: 'kg',
      });
      const rows = await db.select().from(schema.inventoryItems);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.unitOfMeasure).toBe('kg');
    });

    it('updates an existing item', async () => {
      await repo.upsertItem({ id: 'item-1', name: 'OJ', categoryId: 'cat-1', type: 'food' });
      await repo.upsertItem({
        id: 'item-1',
        name: 'Apple Juice',
        categoryId: 'cat-1',
        type: 'food',
      });
      const rows = await db.select().from(schema.inventoryItems);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Apple Juice');
    });
  });

  describe('getItems', () => {
    it('returns items sorted by name with category type', async () => {
      await repo.upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'beverage' });
      await repo.upsertItem({ id: 'item-1', name: 'OJ', categoryId: 'cat-1', type: 'beverage' });
      const items = await repo.getItems();
      expect(items).toHaveLength(1);
      expect(items[0]!.type).toBe('beverage');
    });

    it('returns empty array when no items exist', async () => {
      expect(await repo.getItems()).toEqual([]);
    });
  });

  describe('deleteCategory', () => {
    it('removes the category', async () => {
      await repo.upsertCategory({ id: 'cat-1', name: 'Food', type: 'food' });
      await repo.deleteCategory('cat-1');
      expect(await db.select().from(schema.inventoryCategories)).toHaveLength(0);
    });
  });

  describe('deleteItem', () => {
    it('removes the item', async () => {
      await repo.upsertCategory({ id: 'cat-1', name: 'Food', type: 'food' });
      await repo.upsertItem({ id: 'item-1', name: 'Chips', categoryId: 'cat-1', type: 'food' });
      await repo.deleteItem('item-1');
      expect(await db.select().from(schema.inventoryItems)).toHaveLength(0);
    });
  });
});

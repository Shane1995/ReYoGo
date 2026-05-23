// @vitest-environment node
import { vi, beforeEach, describe, it, expect } from 'vitest';
import * as schema from '../../db/drizzle/schema';
import { createTestDb, type TestDb } from './helpers';

let db: TestDb;

vi.mock('../../db', () => ({ getDb: () => db, schema }));

import {
  upsertCategory,
  getCategories,
  upsertItem,
  getItems,
  deleteCategory,
  deleteItem,
} from '../inventory';

beforeEach(() => {
  db = createTestDb();
});

describe('inventory data access', () => {
  describe('upsertCategory', () => {
    it('creates a new category', async () => {
      await upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'ingredient' });

      const rows = db.select().from(schema.inventoryCategories).all();
      expect(rows).toHaveLength(1);
      const [row] = rows;
      expect(row!.id).toBe('cat-1');
      expect(row!.name).toBe('Beverages');
      expect(row!.type).toBe('ingredient');
    });

    it('updates an existing category idempotently', async () => {
      await upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'ingredient' });
      await upsertCategory({ id: 'cat-1', name: 'Drinks', type: 'finished_good' });

      const rows = db.select().from(schema.inventoryCategories).all();
      expect(rows).toHaveLength(1);
      const [row] = rows;
      expect(row!.name).toBe('Drinks');
      expect(row!.type).toBe('finished_good');
    });
  });

  describe('getCategories', () => {
    it('returns categories sorted by name', async () => {
      await upsertCategory({ id: 'cat-2', name: 'Produce', type: 'ingredient' });
      await upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'ingredient' });
      await upsertCategory({ id: 'cat-3', name: 'Dairy', type: 'ingredient' });

      const cats = await getCategories();
      expect(cats.map((c) => c.name)).toEqual(['Beverages', 'Dairy', 'Produce']);
    });

    it('returns empty array when no categories exist', async () => {
      const cats = await getCategories();
      expect(cats).toEqual([]);
    });
  });

  describe('upsertItem', () => {
    beforeEach(async () => {
      await upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'ingredient' });
    });

    it('creates a new item', async () => {
      await upsertItem({
        id: 'item-1',
        name: 'Orange Juice',
        categoryId: 'cat-1',
        type: 'ingredient',
        unitOfMeasure: 'L',
      });

      const rows = db.select().from(schema.inventoryItems).all();
      expect(rows).toHaveLength(1);
      const [row] = rows;
      expect(row!.id).toBe('item-1');
      expect(row!.name).toBe('Orange Juice');
      expect(row!.categoryId).toBe('cat-1');
      expect(row!.unitOfMeasure).toBe('L');
    });

    it('updates an existing item', async () => {
      await upsertItem({
        id: 'item-1',
        name: 'Orange Juice',
        categoryId: 'cat-1',
        type: 'ingredient',
        unitOfMeasure: 'L',
      });
      await upsertItem({
        id: 'item-1',
        name: 'Apple Juice',
        categoryId: 'cat-1',
        type: 'ingredient',
        unitOfMeasure: 'ml',
      });

      const rows = db.select().from(schema.inventoryItems).all();
      expect(rows).toHaveLength(1);
      const [row] = rows;
      expect(row!.name).toBe('Apple Juice');
      expect(row!.unitOfMeasure).toBe('ml');
    });
  });

  describe('getItems', () => {
    beforeEach(async () => {
      await upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'ingredient' });
    });

    it('returns items joined with category type', async () => {
      await upsertItem({
        id: 'item-1',
        name: 'Orange Juice',
        categoryId: 'cat-1',
        type: 'ingredient',
      });

      const items = await getItems();
      expect(items).toHaveLength(1);
      const [item] = items;
      expect(item!.id).toBe('item-1');
      expect(item!.type).toBe('ingredient');
    });

    it('returns items sorted by name', async () => {
      await upsertItem({
        id: 'item-2',
        name: 'Mango Juice',
        categoryId: 'cat-1',
        type: 'ingredient',
      });
      await upsertItem({
        id: 'item-1',
        name: 'Apple Juice',
        categoryId: 'cat-1',
        type: 'ingredient',
      });
      await upsertItem({
        id: 'item-3',
        name: 'Pineapple Juice',
        categoryId: 'cat-1',
        type: 'ingredient',
      });

      const items = await getItems();
      expect(items.map((i) => i.name)).toEqual(['Apple Juice', 'Mango Juice', 'Pineapple Juice']);
    });
  });

  describe('deleteCategory', () => {
    it('removes a category', async () => {
      await upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'ingredient' });
      await deleteCategory('cat-1');

      const rows = db.select().from(schema.inventoryCategories).all();
      expect(rows).toHaveLength(0);
    });
  });

  describe('deleteItem', () => {
    it('removes an item', async () => {
      await upsertCategory({ id: 'cat-1', name: 'Beverages', type: 'ingredient' });
      await upsertItem({
        id: 'item-1',
        name: 'Orange Juice',
        categoryId: 'cat-1',
        type: 'ingredient',
      });
      await deleteItem('item-1');

      const rows = db.select().from(schema.inventoryItems).all();
      expect(rows).toHaveLength(0);
    });
  });
});

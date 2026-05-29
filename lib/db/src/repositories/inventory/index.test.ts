import { describe, it, expect, beforeEach } from 'vitest';
import { InventoryType } from '@reyogo/types';
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
      await repo.upsertCategory({ id: 'cat-1', name: 'Beverages', type: InventoryType.Beverage });
      const rows = await db.select().from(schema.inventoryCategories);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Beverages');
    });

    it('updates an existing category', async () => {
      await repo.upsertCategory({ id: 'cat-1', name: 'Beverages', type: InventoryType.Beverage });
      await repo.upsertCategory({ id: 'cat-1', name: 'Drinks', type: InventoryType.Beverage });
      const rows = await db.select().from(schema.inventoryCategories);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Drinks');
    });
  });

  describe('getCategories', () => {
    it('returns categories sorted by name', async () => {
      await repo.upsertCategory({ id: 'cat-2', name: 'Produce', type: InventoryType.Food });
      await repo.upsertCategory({ id: 'cat-1', name: 'Beverages', type: InventoryType.Beverage });
      const cats = await repo.getCategories();
      expect(cats.map((c) => c.name)).toEqual(['Beverages', 'Produce']);
    });

    it('returns empty array when no categories exist', async () => {
      expect(await repo.getCategories()).toEqual([]);
    });
  });

  describe('upsertItem', () => {
    beforeEach(() => repo.upsertCategory({ id: 'cat-1', name: 'Food', type: InventoryType.Food }));

    it('creates a new item', async () => {
      await repo.upsertItem({
        id: 'item-1',
        entityId: 'default',
        name: 'Chips',
        categoryId: 'cat-1',
        unitOfMeasureId: null,
        sku: null,
        reorderPoint: null,
        reorderQty: null,
      });
      const rows = await db.select().from(schema.inventoryItems);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Chips');
    });

    it('updates an existing item', async () => {
      await repo.upsertItem({
        id: 'item-1',
        entityId: 'default',
        name: 'OJ',
        categoryId: 'cat-1',
        unitOfMeasureId: null,
        sku: null,
        reorderPoint: null,
        reorderQty: null,
      });
      await repo.upsertItem({
        id: 'item-1',
        entityId: 'default',
        name: 'Apple Juice',
        categoryId: 'cat-1',
        unitOfMeasureId: null,
        sku: null,
        reorderPoint: null,
        reorderQty: null,
      });
      const rows = await db.select().from(schema.inventoryItems);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Apple Juice');
    });
  });

  describe('getItems', () => {
    it('returns items sorted by name with stock quantities', async () => {
      await repo.upsertCategory({ id: 'cat-1', name: 'Beverages', type: InventoryType.Beverage });
      await repo.upsertItem({
        id: 'item-1',
        entityId: 'default',
        name: 'OJ',
        categoryId: 'cat-1',
        unitOfMeasureId: null,
        sku: null,
        reorderPoint: null,
        reorderQty: null,
      });
      const items = await repo.getItems();
      expect(items).toHaveLength(1);
      expect(items[0]!.currentStockQty).toBe(0);
      expect(items[0]!.currentWeightedAvgCost).toBeNull();
    });

    it('returns empty array when no items exist', async () => {
      expect(await repo.getItems()).toEqual([]);
    });
  });

  describe('deleteCategory', () => {
    it('removes the category', async () => {
      await repo.upsertCategory({ id: 'cat-1', name: 'Food', type: InventoryType.Food });
      await repo.deleteCategory('cat-1');
      expect(await db.select().from(schema.inventoryCategories)).toHaveLength(0);
    });
  });

  describe('deleteItem', () => {
    it('removes the item', async () => {
      await repo.upsertCategory({ id: 'cat-1', name: 'Food', type: InventoryType.Food });
      await repo.upsertItem({
        id: 'item-1',
        entityId: 'default',
        name: 'Chips',
        categoryId: 'cat-1',
        unitOfMeasureId: null,
        sku: null,
        reorderPoint: null,
        reorderQty: null,
      });
      await repo.deleteItem('item-1');
      expect(await db.select().from(schema.inventoryItems)).toHaveLength(0);
    });
  });

  describe('submitInventory', () => {
    it('adds and deletes categories and items atomically', async () => {
      await repo.upsertCategory({ id: 'cat-old', name: 'Old', type: InventoryType.Food });
      await repo.submitInventory({
        addedCategories: [{ id: 'cat-new', name: 'New', type: InventoryType.Beverage }],
        updatedCategories: [],
        addedItems: [],
        updatedItems: [],
        deletedCategoryIds: ['cat-old'],
        deletedItemIds: [],
      });
      const cats = await repo.getCategories();
      expect(cats.map((c) => c.id)).toEqual(['cat-new']);
    });
  });
});

describe('archiveItem / restoreItem / hardDeleteItem', () => {
  beforeEach(async () => {
    await repo.upsertCategory({ id: 'cat-1', name: 'Food', type: InventoryType.Food });
    await repo.upsertItem({
      id: 'item-1',
      entityId: 'default',
      name: 'Chips',
      categoryId: 'cat-1',
      unitOfMeasureId: null,
      sku: null,
      reorderPoint: null,
      reorderQty: null,
    });
  });

  it('archiveItem sets archived_at and item disappears from getItems', async () => {
    await repo.archiveItem('item-1');
    const items = await repo.getItems();
    expect(items.find((i) => i.id === 'item-1')).toBeUndefined();
  });

  it('restoreItem clears archived_at and item reappears in getItems', async () => {
    await repo.archiveItem('item-1');
    await repo.restoreItem('item-1');
    const items = await repo.getItems();
    expect(items.find((i) => i.id === 'item-1')).toBeDefined();
  });

  it('getArchivedItems returns only archived items', async () => {
    await repo.archiveItem('item-1');
    const archived = await repo.getArchivedItems();
    expect(archived.map((i) => i.id)).toContain('item-1');
  });

  it('hardDeleteItem removes item with zero usage', async () => {
    await repo.hardDeleteItem('item-1');
    const rows = await db.select().from(schema.inventoryItems);
    expect(rows).toHaveLength(0);
  });

  it('getItemUsageCount returns 0 for unused item', async () => {
    expect(await repo.getItemUsageCount('item-1')).toBe(0);
  });
});

describe('archiveCategory / restoreCategory / hardDeleteCategory', () => {
  beforeEach(async () => {
    await repo.upsertCategory({ id: 'cat-1', name: 'Food', type: InventoryType.Food });
  });

  it('archiveCategory sets archived_at and category disappears from getCategories', async () => {
    await repo.archiveCategory('cat-1');
    const cats = await repo.getCategories();
    expect(cats.find((c) => c.id === 'cat-1')).toBeUndefined();
  });

  it('restoreCategory clears archived_at', async () => {
    await repo.archiveCategory('cat-1');
    await repo.restoreCategory('cat-1');
    const cats = await repo.getCategories();
    expect(cats.find((c) => c.id === 'cat-1')).toBeDefined();
  });

  it('getArchivedCategories returns only archived', async () => {
    await repo.archiveCategory('cat-1');
    const archived = await repo.getArchivedCategories();
    expect(archived.map((c) => c.id)).toContain('cat-1');
  });

  it('hardDeleteCategory removes category with zero usage', async () => {
    await repo.hardDeleteCategory('cat-1');
    expect(await db.select().from(schema.inventoryCategories)).toHaveLength(0);
  });

  it('getCategoryUsageCount returns 0 for empty category', async () => {
    expect(await repo.getCategoryUsageCount('cat-1')).toBe(0);
  });

  it('getCategoryUsageCount counts assigned items', async () => {
    await repo.upsertItem({
      id: 'item-1',
      entityId: 'default',
      name: 'Chips',
      categoryId: 'cat-1',
      unitOfMeasureId: null,
      sku: null,
      reorderPoint: null,
      reorderQty: null,
    });
    expect(await repo.getCategoryUsageCount('cat-1')).toBe(1);
  });
});

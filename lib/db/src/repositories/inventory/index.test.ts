import { describe, it, expect, beforeEach } from 'vitest';
import { InventoryType, MovementType } from '@reyogo/types';
import {
  createTestDb,
  TEST_ACCOUNT_ID,
  TEST_ENTITY_ID,
  TEST_GROUP_ID,
  type DbClient,
} from '../../__tests__/helpers';
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
      await repo.upsertCategory(
        { id: 'cat-1', name: 'Beverages', type: InventoryType.Beverage },
        TEST_ACCOUNT_ID,
      );
      const rows = await db.select().from(schema.inventoryCategories);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Beverages');
    });

    it('updates an existing category', async () => {
      await repo.upsertCategory(
        { id: 'cat-1', name: 'Beverages', type: InventoryType.Beverage },
        TEST_ACCOUNT_ID,
      );
      await repo.upsertCategory(
        { id: 'cat-1', name: 'Drinks', type: InventoryType.Beverage },
        TEST_ACCOUNT_ID,
      );
      const rows = await db.select().from(schema.inventoryCategories);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Drinks');
    });
  });

  describe('getCategories', () => {
    it('returns categories sorted by name', async () => {
      await repo.upsertCategory(
        { id: 'cat-2', name: 'Produce', type: InventoryType.Food },
        TEST_ACCOUNT_ID,
      );
      await repo.upsertCategory(
        { id: 'cat-1', name: 'Beverages', type: InventoryType.Beverage },
        TEST_ACCOUNT_ID,
      );
      const cats = await repo.getCategories();
      expect(cats.map((c) => c.name)).toEqual(['Beverages', 'Produce']);
    });

    it('returns empty array when no categories exist', async () => {
      expect(await repo.getCategories()).toEqual([]);
    });
  });

  describe('upsertItem', () => {
    beforeEach(() =>
      repo.upsertCategory({ id: 'cat-1', name: 'Food', type: InventoryType.Food }, TEST_ACCOUNT_ID),
    );

    it('creates a new item', async () => {
      await repo.upsertItem(
        {
          id: 'item-1',
          name: 'Chips',
          categoryId: 'cat-1',
          unitOfMeasureId: null,
          sku: null,
          reorderPoint: null,
          reorderQty: null,
        },
        TEST_GROUP_ID,
      );
      const rows = await db.select().from(schema.inventoryItems);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Chips');
    });

    it('updates an existing item', async () => {
      await repo.upsertItem(
        {
          id: 'item-1',
          name: 'OJ',
          categoryId: 'cat-1',
          unitOfMeasureId: null,
          sku: null,
          reorderPoint: null,
          reorderQty: null,
        },
        TEST_GROUP_ID,
      );
      await repo.upsertItem(
        {
          id: 'item-1',
          name: 'Apple Juice',
          categoryId: 'cat-1',
          unitOfMeasureId: null,
          sku: null,
          reorderPoint: null,
          reorderQty: null,
        },
        TEST_GROUP_ID,
      );
      const rows = await db.select().from(schema.inventoryItems);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe('Apple Juice');
    });
  });

  describe('getItems', () => {
    beforeEach(async () => {
      await repo.upsertCategory(
        { id: 'cat-1', name: 'Beverages', type: InventoryType.Beverage },
        TEST_ACCOUNT_ID,
      );
      await repo.upsertItem(
        {
          id: 'item-1',
          name: 'OJ',
          categoryId: 'cat-1',
          unitOfMeasureId: null,
          sku: null,
          reorderPoint: null,
          reorderQty: null,
        },
        TEST_GROUP_ID,
      );
    });

    it('returns all group items with zero stock when no movements exist', async () => {
      const items = await repo.getItems(TEST_ENTITY_ID);
      expect(items).toHaveLength(1);
      expect(items[0]!.currentStockQty).toBe(0);
    });

    it('per-entity: returns stock qty from that entity only', async () => {
      await db.insert(schema.stockMovements).values({
        id: 'mv-1',
        accountId: 'default',
        entityId: TEST_ENTITY_ID,
        inventoryItemId: 'item-1',
        movementType: MovementType.In,
        qty: 10,
        stockQtyAfter: 10,
        occurredAt: new Date('2024-01-01'),
        createdAt: new Date(),
      });
      const items = await repo.getItems(TEST_ENTITY_ID);
      expect(items[0]!.currentStockQty).toBe(10);
    });

    it('aggregate (no entityId): sums latest stock across all entities', async () => {
      await db.insert(schema.entities).values({
        id: 'entity-2',
        groupId: TEST_GROUP_ID,
        name: 'Entity 2',
        createdAt: new Date(),
      });
      await db.insert(schema.stockMovements).values([
        {
          id: 'mv-1',
          accountId: 'default',
          entityId: TEST_ENTITY_ID,
          inventoryItemId: 'item-1',
          movementType: MovementType.In,
          qty: 10,
          stockQtyAfter: 10,
          occurredAt: new Date('2024-01-01'),
          createdAt: new Date(),
        },
        {
          id: 'mv-2',
          accountId: 'default',
          entityId: 'entity-2',
          inventoryItemId: 'item-1',
          movementType: MovementType.In,
          qty: 5,
          stockQtyAfter: 5,
          occurredAt: new Date('2024-01-02'),
          createdAt: new Date(),
        },
      ]);
      const items = await repo.getItems();
      expect(items[0]!.currentStockQty).toBe(15);
    });

    it('returns empty array when no items exist', async () => {
      await db.delete(schema.inventoryItems);
      expect(await repo.getItems(TEST_ENTITY_ID)).toEqual([]);
    });
  });

  describe('deleteCategory', () => {
    it('removes the category', async () => {
      await repo.upsertCategory(
        { id: 'cat-1', name: 'Food', type: InventoryType.Food },
        TEST_ACCOUNT_ID,
      );
      await repo.deleteCategory('cat-1');
      expect(await db.select().from(schema.inventoryCategories)).toHaveLength(0);
    });
  });

  describe('deleteItem', () => {
    it('removes the item', async () => {
      await repo.upsertCategory(
        { id: 'cat-1', name: 'Food', type: InventoryType.Food },
        TEST_ACCOUNT_ID,
      );
      await repo.upsertItem(
        {
          id: 'item-1',
          name: 'Chips',
          categoryId: 'cat-1',
          unitOfMeasureId: null,
          sku: null,
          reorderPoint: null,
          reorderQty: null,
        },
        TEST_GROUP_ID,
      );
      await repo.deleteItem('item-1');
      expect(await db.select().from(schema.inventoryItems)).toHaveLength(0);
    });
  });

  describe('submitInventory', () => {
    it('adds and deletes categories and items atomically', async () => {
      await repo.upsertCategory(
        { id: 'cat-old', name: 'Old', type: InventoryType.Food },
        TEST_ACCOUNT_ID,
      );
      await repo.submitInventory(
        {
          addedCategories: [{ id: 'cat-new', name: 'New', type: InventoryType.Beverage }],
          updatedCategories: [],
          addedItems: [],
          updatedItems: [],
          deletedCategoryIds: ['cat-old'],
          deletedItemIds: [],
        },
        TEST_ACCOUNT_ID,
        TEST_GROUP_ID,
      );
      const cats = await repo.getCategories();
      expect(cats.map((c) => c.id)).toEqual(['cat-new']);
    });
  });
});

describe('archiveItem / restoreItem / hardDeleteItem', () => {
  beforeEach(async () => {
    await repo.upsertCategory(
      { id: 'cat-1', name: 'Food', type: InventoryType.Food },
      TEST_ACCOUNT_ID,
    );
    await repo.upsertItem(
      {
        id: 'item-1',
        name: 'Chips',
        categoryId: 'cat-1',
        unitOfMeasureId: null,
        sku: null,
        reorderPoint: null,
        reorderQty: null,
      },
      TEST_GROUP_ID,
    );
  });

  it('archiveItem sets archived_at and item disappears from getItems', async () => {
    await repo.archiveItem('item-1');
    const items = await repo.getItems(TEST_ENTITY_ID);
    expect(items.find((i) => i.id === 'item-1')).toBeUndefined();
  });

  it('restoreItem clears archived_at and item reappears in getItems', async () => {
    await repo.archiveItem('item-1');
    await repo.restoreItem('item-1');
    const items = await repo.getItems(TEST_ENTITY_ID);
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

  it('hardDeleteItem throws when item has usage', async () => {
    await db.insert(schema.stockMovements).values({
      id: 'mv-1',
      accountId: 'default',
      inventoryItemId: 'item-1',
      entityId: TEST_ENTITY_ID,
      movementType: MovementType.In,
      qty: 5,
      stockQtyAfter: 5,
      occurredAt: new Date(),
      createdAt: new Date(),
    });
    await expect(repo.hardDeleteItem('item-1')).rejects.toThrow();
  });

  it('getItemUsageCount returns 0 for unused item', async () => {
    expect(await repo.getItemUsageCount('item-1')).toBe(0);
  });
});

describe('archiveCategory / restoreCategory / hardDeleteCategory', () => {
  beforeEach(async () => {
    await repo.upsertCategory(
      { id: 'cat-1', name: 'Food', type: InventoryType.Food },
      TEST_ACCOUNT_ID,
    );
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

  it('archiveCategory cascades to archive items in that category', async () => {
    await repo.upsertItem(
      {
        id: 'item-1',
        name: 'Chips',
        categoryId: 'cat-1',
        unitOfMeasureId: null,
        sku: null,
        reorderPoint: null,
        reorderQty: null,
      },
      TEST_GROUP_ID,
    );
    await repo.archiveCategory('cat-1');
    const items = await repo.getItems(TEST_ENTITY_ID);
    expect(items.find((i) => i.id === 'item-1')).toBeUndefined();
  });

  it('restoreCategory cascades to restore items in that category', async () => {
    await repo.upsertItem(
      {
        id: 'item-1',
        name: 'Chips',
        categoryId: 'cat-1',
        unitOfMeasureId: null,
        sku: null,
        reorderPoint: null,
        reorderQty: null,
      },
      TEST_GROUP_ID,
    );
    await repo.archiveCategory('cat-1');
    await repo.restoreCategory('cat-1');
    const items = await repo.getItems(TEST_ENTITY_ID);
    expect(items.find((i) => i.id === 'item-1')).toBeDefined();
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

  it('hardDeleteCategory throws when category has assigned items', async () => {
    await repo.upsertItem(
      {
        id: 'item-1',
        name: 'Chips',
        categoryId: 'cat-1',
        unitOfMeasureId: null,
        sku: null,
        reorderPoint: null,
        reorderQty: null,
      },
      TEST_GROUP_ID,
    );
    await expect(repo.hardDeleteCategory('cat-1')).rejects.toThrow();
  });

  it('getCategoryUsageCount returns 0 for empty category', async () => {
    expect(await repo.getCategoryUsageCount('cat-1')).toBe(0);
  });

  it('getCategoryUsageCount counts assigned items', async () => {
    await repo.upsertItem(
      {
        id: 'item-1',
        name: 'Chips',
        categoryId: 'cat-1',
        unitOfMeasureId: null,
        sku: null,
        reorderPoint: null,
        reorderQty: null,
      },
      TEST_GROUP_ID,
    );
    expect(await repo.getCategoryUsageCount('cat-1')).toBe(1);
  });
});

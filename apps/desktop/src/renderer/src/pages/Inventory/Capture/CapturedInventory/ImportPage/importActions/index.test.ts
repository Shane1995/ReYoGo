import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryType } from '@reyogo/types';
import { UNIT_STATUS, CATEGORY_STATUS, ITEM_STATUS } from '@/components/CsvImport/review';
import type { ReviewResult } from '@/components/CsvImport/review';
import type { InventoryCategory, InventoryItem } from '../../types';
import { loadExistingInventory, commitReview } from '.';

const mockInvoke = vi.fn();

beforeEach(() => {
  mockInvoke.mockReset();
  Object.defineProperty(window, 'electronAPI', {
    value: { ipcRenderer: { invoke: mockInvoke } },
    writable: true,
    configurable: true,
  });
});

const existingCats: InventoryCategory[] = [{ id: 'cat-bev', name: 'Beverages', type: 'beverage' }];
const existingItems: InventoryItem[] = [
  { id: 'item-cola', name: 'Cola', categoryId: 'cat-bev', type: 'beverage' },
];

function makeReview(overrides: Partial<ReviewResult> = {}): ReviewResult {
  return {
    units: [
      { name: 'litres', status: UNIT_STATUS.New, selected: true },
      { name: 'kgs', status: UNIT_STATUS.Exists, selected: false },
    ],
    categories: [
      {
        id: 'cat-1',
        name: 'Dairy',
        type: InventoryType.Food,
        status: CATEGORY_STATUS.New,
        selected: true,
      },
      {
        id: 'cat-bev',
        name: 'Beverages',
        type: InventoryType.Beverage,
        status: CATEGORY_STATUS.Exists,
        selected: false,
      },
    ],
    items: [
      {
        name: 'Milk',
        categoryName: 'Dairy',
        unit: 'litres',
        status: ITEM_STATUS.New,
        selected: true,
      },
      {
        name: 'Cola',
        categoryName: 'Beverages',
        unit: 'litres',
        status: ITEM_STATUS.Exists,
        selected: false,
      },
    ],
    parseErrors: [],
    availableCategories: [],
    counts: { newTotal: 2, existsTotal: 2, unresolvedTotal: 0 },
    ...overrides,
  };
}

describe('loadExistingInventory', () => {
  it('builds an ExistingInventory from existing data and the units IPC response', async () => {
    mockInvoke.mockResolvedValue([{ name: 'Litres' }, { name: 'kgs' }]);

    const result = await loadExistingInventory(existingCats, existingItems);

    expect(mockInvoke).toHaveBeenCalledWith('setup:get-units');
    expect(result.categoryNames).toEqual(new Set(['beverages']));
    expect(result.itemNames).toEqual(new Set(['cola']));
    expect(result.unitNames).toEqual(new Set(['litres', 'kgs']));
    expect(result.categoryList).toEqual([{ name: 'Beverages', type: 'beverage' }]);
  });
});

describe('commitReview', () => {
  it('upserts new units, adds new categories, and adds new items', async () => {
    mockInvoke.mockImplementation((channel: string) => {
      if (channel === 'setup:get-units') return Promise.resolve([{ id: 'unit-kgs', name: 'kgs' }]);
      return Promise.resolve(undefined);
    });
    const addCategory = vi.fn().mockReturnValue('cat-dairy-id');
    const addItem = vi.fn().mockReturnValue('item-milk-id');

    await commitReview(makeReview(), existingCats, 'entity-1', addCategory, addItem);

    expect(mockInvoke).toHaveBeenCalledWith(
      'setup:upsert-unit',
      expect.objectContaining({ name: 'litres' }),
    );
    expect(addCategory).toHaveBeenCalledWith({ name: 'Dairy', type: InventoryType.Food });
    expect(addItem).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Milk',
        categoryId: 'cat-dairy-id',
        type: InventoryType.Food,
        unitOfMeasure: 'litres',
        entityId: 'entity-1',
      }),
    );
  });

  it('skips items whose category did not get an id', async () => {
    mockInvoke.mockResolvedValue([]);
    const addCategory = vi.fn().mockReturnValue('cat-dairy-id');
    const addItem = vi.fn().mockReturnValue('item-id');

    const review = makeReview({
      items: [
        { name: 'Mystery', categoryName: 'Unknown', status: ITEM_STATUS.New, selected: true },
      ],
    });

    await commitReview(review, existingCats, 'entity-1', addCategory, addItem);

    expect(addItem).not.toHaveBeenCalled();
  });

  it('falls back to a null unitOfMeasureId when the item has no unit', async () => {
    mockInvoke.mockResolvedValue([]);
    const addCategory = vi.fn().mockReturnValue('cat-dairy-id');
    const addItem = vi.fn().mockReturnValue('item-id');

    const review = makeReview({
      categories: [
        {
          id: 'cat-1',
          name: 'Dairy',
          type: InventoryType.Food,
          status: CATEGORY_STATUS.New,
          selected: true,
        },
      ],
      items: [{ name: 'Butter', categoryName: 'Dairy', status: ITEM_STATUS.New, selected: true }],
    });

    await commitReview(review, existingCats, 'entity-1', addCategory, addItem);

    expect(addItem).toHaveBeenCalledWith(expect.objectContaining({ unitOfMeasureId: null }));
  });
});

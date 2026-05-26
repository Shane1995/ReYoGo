import { describe, it, expect } from 'vitest';
import { enrichParseResult, UNIT_STATUS, CATEGORY_STATUS, ITEM_STATUS } from '.';
import type { ExistingInventory } from '.';
import type { ParseResult } from '../parser';
import { InventoryType } from '@reyogo/types';

const emptyExisting: ExistingInventory = {
  categoryNames: new Set(),
  itemNames: new Set(),
  unitNames: new Set(),
  categoryList: [],
};

describe('enrichParseResult', () => {
  describe('units', () => {
    it('marks a new unit as new and selected', () => {
      const result: ParseResult = {
        units: [{ name: 'litres' }],
        categories: [],
        items: [],
        errors: [],
      };
      const { units } = enrichParseResult(result, emptyExisting);
      expect(units[0]).toMatchObject({ name: 'litres', status: UNIT_STATUS.New, selected: true });
    });

    it('marks an existing unit as exists and deselected', () => {
      const result: ParseResult = {
        units: [{ name: 'kgs' }],
        categories: [],
        items: [],
        errors: [],
      };
      const existing: ExistingInventory = { ...emptyExisting, unitNames: new Set(['kgs']) };
      const { units } = enrichParseResult(result, existing);
      expect(units).toMatchObject([{ status: UNIT_STATUS.Exists, selected: false }]);
    });

    it('matches existing units case-insensitively', () => {
      const result: ParseResult = {
        units: [{ name: 'KGS' }],
        categories: [],
        items: [],
        errors: [],
      };
      const existing: ExistingInventory = { ...emptyExisting, unitNames: new Set(['kgs']) };
      const { units } = enrichParseResult(result, existing);
      expect(units).toMatchObject([{ status: UNIT_STATUS.Exists }]);
    });
  });

  describe('categories', () => {
    it('marks a new category with valid type as new and selected', () => {
      const result: ParseResult = {
        units: [],
        categories: [{ name: 'Dairy', type: InventoryType.Food }],
        items: [],
        errors: [],
      };
      const { categories } = enrichParseResult(result, emptyExisting);
      expect(categories[0]).toMatchObject({
        status: CATEGORY_STATUS.New,
        selected: true,
        typeWarning: false,
      });
    });

    it('marks an existing category as exists and deselected', () => {
      const result: ParseResult = {
        units: [],
        categories: [{ name: 'Dairy', type: InventoryType.Food }],
        items: [],
        errors: [],
      };
      const existing: ExistingInventory = {
        ...emptyExisting,
        categoryNames: new Set(['dairy']),
        categoryList: [{ name: 'Dairy', type: InventoryType.Food }],
      };
      const { categories } = enrichParseResult(result, existing);
      expect(categories).toMatchObject([{ status: CATEGORY_STATUS.Exists, selected: false }]);
    });

    it('sets typeWarning on a new category with an unrecognised type', () => {
      const result: ParseResult = {
        units: [],
        categories: [{ name: 'Misc', type: 'unknown' as InventoryType }],
        items: [],
        errors: [],
      };
      const { categories } = enrichParseResult(result, emptyExisting);
      expect(categories).toMatchObject([{ typeWarning: true }]);
    });

    it('does not set typeWarning on an existing category regardless of type', () => {
      const result: ParseResult = {
        units: [],
        categories: [{ name: 'Old', type: 'unknown' as InventoryType }],
        items: [],
        errors: [],
      };
      const existing: ExistingInventory = {
        ...emptyExisting,
        categoryNames: new Set(['old']),
      };
      const { categories } = enrichParseResult(result, existing);
      expect(categories).toMatchObject([{ typeWarning: false }]);
    });
  });

  describe('items', () => {
    it('marks an existing item as exists and deselected', () => {
      const result: ParseResult = {
        units: [],
        categories: [{ name: 'Dairy', type: InventoryType.Food }],
        items: [{ name: 'Milk', categoryName: 'Dairy', unit: 'litres' }],
        errors: [],
      };
      const existing: ExistingInventory = {
        ...emptyExisting,
        itemNames: new Set(['milk']),
        categoryNames: new Set(['dairy']),
      };
      const { items } = enrichParseResult(result, existing);
      expect(items[0]).toMatchObject({ status: ITEM_STATUS.Exists, selected: false });
    });

    it('marks an item without a unit as unresolved', () => {
      const result: ParseResult = {
        units: [],
        categories: [{ name: 'Dairy', type: InventoryType.Food }],
        items: [{ name: 'Milk', categoryName: 'Dairy' }],
        errors: [],
      };
      const { items } = enrichParseResult(result, emptyExisting);
      expect(items[0]).toMatchObject({
        status: ITEM_STATUS.Unresolved,
        selected: false,
        unresolvedReason: expect.stringContaining('No unit of measure'),
      });
    });

    it('marks an item whose category is missing as unresolved', () => {
      const result: ParseResult = {
        units: [],
        categories: [],
        items: [{ name: 'Milk', categoryName: 'Dairy', unit: 'litres' }],
        errors: [],
      };
      const { items } = enrichParseResult(result, emptyExisting);
      expect(items[0]).toMatchObject({
        status: ITEM_STATUS.Unresolved,
        unresolvedReason: expect.stringContaining('Category not found: Dairy'),
      });
    });

    it('marks a new item with a category from the same import as new and selected', () => {
      const result: ParseResult = {
        units: [],
        categories: [{ name: 'Dairy', type: InventoryType.Food }],
        items: [{ name: 'Milk', categoryName: 'Dairy', unit: 'litres' }],
        errors: [],
      };
      const { items } = enrichParseResult(result, emptyExisting);
      expect(items[0]).toMatchObject({ status: ITEM_STATUS.New, selected: true });
    });

    it('marks a new item with a category from the existing DB as new and selected', () => {
      const result: ParseResult = {
        units: [],
        categories: [],
        items: [{ name: 'Milk', categoryName: 'Dairy', unit: 'litres' }],
        errors: [],
      };
      const existing: ExistingInventory = {
        ...emptyExisting,
        categoryNames: new Set(['dairy']),
        categoryList: [{ name: 'Dairy', type: InventoryType.Food }],
      };
      const { items } = enrichParseResult(result, existing);
      expect(items[0]).toMatchObject({ status: ITEM_STATUS.New, selected: true });
    });
  });

  describe('availableCategories', () => {
    it('merges existing and imported categories, deduplicates, and sorts by name', () => {
      const result: ParseResult = {
        units: [],
        categories: [
          { name: 'Beverages', type: InventoryType.Beverage },
          { name: 'Dairy', type: InventoryType.Food },
        ],
        items: [],
        errors: [],
      };
      const existing: ExistingInventory = {
        ...emptyExisting,
        categoryNames: new Set(['dairy']),
        categoryList: [{ name: 'Dairy', type: InventoryType.Food }],
      };
      const { availableCategories } = enrichParseResult(result, existing);
      expect(availableCategories.map((c) => c.name)).toEqual(['Beverages', 'Dairy']);
    });
  });

  describe('counts', () => {
    it('returns correct new, exists, and unresolved totals', () => {
      const result: ParseResult = {
        units: [{ name: 'litres' }, { name: 'kgs' }],
        categories: [
          { name: 'New Cat', type: InventoryType.Food },
          { name: 'Old Cat', type: InventoryType.Food },
        ],
        items: [
          { name: 'New Item', categoryName: 'New Cat', unit: 'litres' },
          { name: 'Orphan', categoryName: 'Missing Cat', unit: 'litres' },
        ],
        errors: [],
      };
      const existing: ExistingInventory = {
        ...emptyExisting,
        unitNames: new Set(['kgs']),
        categoryNames: new Set(['old cat']),
        categoryList: [{ name: 'Old Cat', type: InventoryType.Food }],
      };
      const { counts } = enrichParseResult(result, existing);
      expect(counts.newTotal).toBe(3); // 1 unit + 1 category + 1 item
      expect(counts.existsTotal).toBe(2); // 1 unit + 1 category
      expect(counts.unresolvedTotal).toBe(1); // 1 item with missing category
    });
  });
});

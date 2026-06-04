import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useItemFilters } from './index';
import type { InventoryCategory, InventoryItem } from '../../../../types';
import type { ItemCostEntry } from '../../../../hooks/useInventoryCosts';

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'item-1',
    name: 'Chicken Breast',
    type: 'food',
    categoryId: 'cat-1',
    unitOfMeasure: 'kg',
    ...overrides,
  };
}

function makeCategory(overrides: Partial<InventoryCategory> = {}): InventoryCategory {
  return { id: 'cat-1', name: 'Poultry', type: 'food', ...overrides };
}

const emptyCostMap = new Map<string, ItemCostEntry>();
const emptyStockMap = new Map<string, number>();

describe('useItemFilters', () => {
  describe('flatItems', () => {
    it('attaches category name from the matching category', () => {
      const { result } = renderHook(() =>
        useItemFilters({
          items: [makeItem()],
          categories: [makeCategory()],
          costMap: emptyCostMap,
          stockMap: emptyStockMap,
        }),
      );
      expect(result.current.filteredItems[0]!.categoryName).toBe('Poultry');
    });

    it('uses "—" when category is not found', () => {
      const { result } = renderHook(() =>
        useItemFilters({
          items: [makeItem({ categoryId: 'missing' })],
          categories: [],
          costMap: emptyCostMap,
          stockMap: emptyStockMap,
        }),
      );
      expect(result.current.filteredItems[0]!.categoryName).toBe('—');
    });

    it('attaches cost and stock from maps', () => {
      const costMap = new Map<string, ItemCostEntry>([
        [
          'item-1',
          {
            lastUnitCost: 12.5,
            lastCostDate: null,
            weightedAvgCost: 11,
            lastUnitCostInclVat: 14.375,
          },
        ],
      ]);
      const stockMap = new Map([['item-1', 50]]);
      const { result } = renderHook(() =>
        useItemFilters({
          items: [makeItem()],
          categories: [makeCategory()],
          costMap,
          stockMap,
        }),
      );
      expect(result.current.filteredItems[0]!.lastCostPerUnit).toBe(12.5);
      expect(result.current.filteredItems[0]!.lastCostPerUnitInclVat).toBe(14.375);
      expect(result.current.filteredItems[0]!.currentStock).toBe(50);
      expect(result.current.filteredItems[0]!.weightedAvgCost).toBe(11);
    });
  });

  describe('search filter', () => {
    it('returns all items when search is empty', () => {
      const items = [makeItem({ id: 'a', name: 'Apple' }), makeItem({ id: 'b', name: 'Banana' })];
      const { result } = renderHook(() =>
        useItemFilters({ items, categories: [], costMap: emptyCostMap, stockMap: emptyStockMap }),
      );
      expect(result.current.filteredItems).toHaveLength(2);
    });

    it('filters case-insensitively by name', () => {
      const items = [makeItem({ id: 'a', name: 'Apple' }), makeItem({ id: 'b', name: 'Banana' })];
      const { result } = renderHook(() =>
        useItemFilters({ items, categories: [], costMap: emptyCostMap, stockMap: emptyStockMap }),
      );
      act(() => result.current.handleFilterChange('search', 'apple'));
      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0]!.name).toBe('Apple');
    });
  });

  describe('type filter', () => {
    it('filters to only matching type', () => {
      const items = [makeItem({ id: 'a', type: 'food' }), makeItem({ id: 'b', type: 'beverage' })];
      const { result } = renderHook(() =>
        useItemFilters({ items, categories: [], costMap: emptyCostMap, stockMap: emptyStockMap }),
      );
      act(() => result.current.handleFilterChange('type', 'beverage'));
      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0]!.type).toBe('beverage');
    });

    it('clears out-of-type category selections when type changes', () => {
      const categories = [
        makeCategory({ id: 'cat-food', type: 'food' }),
        makeCategory({ id: 'cat-bev', type: 'beverage' }),
      ];
      const items = [
        makeItem({ id: 'a', type: 'food', categoryId: 'cat-food' }),
        makeItem({ id: 'b', type: 'beverage', categoryId: 'cat-bev' }),
      ];
      const { result } = renderHook(() =>
        useItemFilters({ items, categories, costMap: emptyCostMap, stockMap: emptyStockMap }),
      );
      act(() => result.current.handleFilterChange('category', ['cat-food', 'cat-bev']));
      act(() => result.current.handleFilterChange('type', 'food'));
      const catFilter = result.current.filterValues.category as string[];
      expect(catFilter).not.toContain('cat-bev');
    });
  });

  describe('category filter', () => {
    it('filters to items in the selected categories', () => {
      const categories = [
        makeCategory({ id: 'cat-1', name: 'Poultry' }),
        makeCategory({ id: 'cat-2', name: 'Seafood' }),
      ];
      const items = [
        makeItem({ id: 'a', categoryId: 'cat-1' }),
        makeItem({ id: 'b', categoryId: 'cat-2' }),
      ];
      const { result } = renderHook(() =>
        useItemFilters({ items, categories, costMap: emptyCostMap, stockMap: emptyStockMap }),
      );
      act(() => result.current.handleFilterChange('category', ['cat-2']));
      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0]!.categoryId).toBe('cat-2');
    });
  });

  describe('unit filter', () => {
    it('filters to items with the selected unit', () => {
      const items = [
        makeItem({ id: 'a', unitOfMeasure: 'kg' }),
        makeItem({ id: 'b', unitOfMeasure: 'L' }),
      ];
      const { result } = renderHook(() =>
        useItemFilters({ items, categories: [], costMap: emptyCostMap, stockMap: emptyStockMap }),
      );
      act(() => result.current.handleFilterChange('unit', ['L']));
      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0]!.unitOfMeasure).toBe('L');
    });
  });

  describe('clearFilters', () => {
    it('resets all filter values and restores full item list', () => {
      const items = [makeItem({ id: 'a', name: 'Apple' }), makeItem({ id: 'b', name: 'Banana' })];
      const { result } = renderHook(() =>
        useItemFilters({ items, categories: [], costMap: emptyCostMap, stockMap: emptyStockMap }),
      );
      act(() => result.current.handleFilterChange('search', 'apple'));
      expect(result.current.filteredItems).toHaveLength(1);
      act(() => result.current.clearFilters());
      expect(result.current.filteredItems).toHaveLength(2);
      expect(result.current.filterValues).toEqual({});
    });
  });
});

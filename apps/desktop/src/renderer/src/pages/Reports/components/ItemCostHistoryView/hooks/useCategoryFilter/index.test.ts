import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCategoryFilter } from '.';
import type { ItemGroup } from '@/pages/Inventory/Analysis/types';

function group(overrides: Partial<ItemGroup> = {}): ItemGroup {
  return {
    itemId: 'item-1',
    name: 'Flour',
    categoryType: 'food',
    categoryName: 'Dry Goods',
    entries: [],
    ...overrides,
  };
}

describe('useCategoryFilter', () => {
  it('lists distinct category names sorted alphabetically', () => {
    const groups = [
      group({ itemId: 'a', categoryName: 'Dairy' }),
      group({ itemId: 'b', categoryName: 'Beverages' }),
      group({ itemId: 'c', categoryName: 'Dairy' }),
    ];
    const { result } = renderHook(() => useCategoryFilter(groups));
    expect(result.current.availableCategories).toEqual(['Beverages', 'Dairy']);
  });

  it('returns all groups when no categories are selected', () => {
    const groups = [group({ itemId: 'a' }), group({ itemId: 'b', categoryName: 'Beverages' })];
    const { result } = renderHook(() => useCategoryFilter(groups));
    expect(result.current.filteredGroups).toHaveLength(2);
  });

  it('filters groups down to the selected categories', () => {
    const groups = [
      group({ itemId: 'a', categoryName: 'Dairy' }),
      group({ itemId: 'b', categoryName: 'Beverages' }),
      group({ itemId: 'c', categoryName: 'Meat' }),
    ];
    const { result } = renderHook(() => useCategoryFilter(groups));
    act(() => result.current.setSelectedCategories(['Dairy', 'Beverages']));
    expect(result.current.filteredGroups.map((g) => g.itemId)).toEqual(['a', 'b']);
  });
});

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useItemGroupCategoryFilter } from '.';
import type { ItemGroup } from '../../Analysis/types';

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

describe('useItemGroupCategoryFilter', () => {
  it('lists distinct category names sorted alphabetically', () => {
    const groups = [
      group({ itemId: 'a', categoryName: 'Dairy' }),
      group({ itemId: 'b', categoryName: 'Beverages' }),
      group({ itemId: 'c', categoryName: 'Dairy' }),
    ];
    const { result } = renderHook(() => useItemGroupCategoryFilter(groups));
    expect(result.current.availableCategories).toEqual(['Beverages', 'Dairy']);
  });

  it('omits groups with no categoryName from availableCategories', () => {
    const groups = [group({ categoryName: undefined })];
    const { result } = renderHook(() => useItemGroupCategoryFilter(groups));
    expect(result.current.availableCategories).toEqual([]);
  });

  it('returns all groups when no category filter is set', () => {
    const groups = [group({ itemId: 'a' }), group({ itemId: 'b', categoryName: 'Beverages' })];
    const { result } = renderHook(() => useItemGroupCategoryFilter(groups));
    expect(result.current.filteredGroups).toHaveLength(2);
  });

  it('filters groups down to the selected category', () => {
    const groups = [
      group({ itemId: 'a', categoryName: 'Dairy' }),
      group({ itemId: 'b', categoryName: 'Beverages' }),
    ];
    const { result } = renderHook(() => useItemGroupCategoryFilter(groups));
    act(() => result.current.setFilterCategory('Beverages'));
    expect(result.current.filteredGroups).toHaveLength(1);
    expect(result.current.filteredGroups[0]!.itemId).toBe('b');
  });
});

import { describe, it, expect } from 'vitest';
import { filterGroupsByType } from '.';
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

describe('filterGroupsByType', () => {
  it('returns all groups when no type is selected', () => {
    const groups = [group({ itemId: 'a' }), group({ itemId: 'b', categoryType: 'beverage' })];
    expect(filterGroupsByType(groups, '')).toEqual(groups);
  });

  it('filters groups down to the selected type', () => {
    const groups = [
      group({ itemId: 'a', categoryType: 'food' }),
      group({ itemId: 'b', categoryType: 'beverage' }),
      group({ itemId: 'c', categoryType: 'food' }),
    ];
    expect(filterGroupsByType(groups, 'food').map((g) => g.itemId)).toEqual(['a', 'c']);
  });
});

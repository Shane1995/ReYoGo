import { describe, it, expect } from 'vitest';
import { filterGroupsByCategories } from '.';
import type { ItemGroup } from '@/pages/Inventory/Analysis/types';

function groupOf(itemId: string, categoryName?: string): ItemGroup {
  return { itemId, name: itemId, categoryType: 'food', categoryName, entries: [] };
}

describe('filterGroupsByCategories', () => {
  const groups = [groupOf('item-1', 'Dairy'), groupOf('item-2', 'Beverages'), groupOf('item-3')];

  it('returns all groups when nothing is selected', () => {
    expect(filterGroupsByCategories(groups, [])).toEqual(groups);
  });

  it('keeps groups matching any selected category', () => {
    const filtered = filterGroupsByCategories(groups, ['Dairy', 'Beverages']);
    expect(filtered.map((g) => g.itemId)).toEqual(['item-1', 'item-2']);
  });

  it('excludes groups without a matching category', () => {
    const filtered = filterGroupsByCategories(groups, ['Dairy']);
    expect(filtered.map((g) => g.itemId)).toEqual(['item-1']);
  });
});

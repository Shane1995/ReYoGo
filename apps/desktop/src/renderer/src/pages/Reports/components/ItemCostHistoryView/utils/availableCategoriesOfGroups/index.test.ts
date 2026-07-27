import { describe, it, expect } from 'vitest';
import { availableCategoriesOfGroups } from '.';
import type { ItemGroup } from '@/pages/Inventory/Analysis/types';

function groupOf(categoryName?: string): ItemGroup {
  return {
    itemId: categoryName ?? 'none',
    name: 'Item',
    categoryType: 'food',
    categoryName,
    entries: [],
  };
}

describe('availableCategoriesOfGroups', () => {
  it('returns sorted, de-duplicated category names', () => {
    const groups = [groupOf('Dairy'), groupOf('Beverages'), groupOf('Dairy')];
    expect(availableCategoriesOfGroups(groups)).toEqual(['Beverages', 'Dairy']);
  });

  it('excludes groups with no category', () => {
    expect(availableCategoriesOfGroups([groupOf(undefined)])).toEqual([]);
  });
});

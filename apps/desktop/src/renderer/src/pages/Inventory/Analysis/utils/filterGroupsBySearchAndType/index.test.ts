import { describe, it, expect } from 'vitest';
import { filterGroupsBySearchAndType } from '.';
import type { ItemGroup } from '../../types';

function group(overrides: Partial<ItemGroup> = {}): ItemGroup {
  return { itemId: 'item-1', name: 'Flour', categoryType: 'food', entries: [], ...overrides };
}

describe('filterGroupsBySearchAndType', () => {
  it('returns all groups when search and type are empty', () => {
    const groups = [group(), group({ itemId: 'item-2', name: 'Milk' })];
    expect(filterGroupsBySearchAndType(groups, '', '')).toHaveLength(2);
  });

  it('filters by case-insensitive name search', () => {
    const groups = [group({ name: 'Flour' }), group({ itemId: 'item-2', name: 'Milk' })];
    const result = filterGroupsBySearchAndType(groups, 'flo', '');
    expect(result).toEqual([group({ name: 'Flour' })]);
  });

  it('filters by categoryType', () => {
    const groups = [
      group({ categoryType: 'food' }),
      group({ itemId: 'item-2', categoryType: 'beverage' }),
    ];
    const result = filterGroupsBySearchAndType(groups, '', 'beverage');
    expect(result).toHaveLength(1);
    expect(result[0]!.categoryType).toBe('beverage');
  });

  it('applies both filters together', () => {
    const groups = [
      group({ name: 'Flour', categoryType: 'food' }),
      group({ itemId: 'item-2', name: 'Flour', categoryType: 'beverage' }),
    ];
    const result = filterGroupsBySearchAndType(groups, 'flour', 'beverage');
    expect(result).toHaveLength(1);
    expect(result[0]!.itemId).toBe('item-2');
  });
});

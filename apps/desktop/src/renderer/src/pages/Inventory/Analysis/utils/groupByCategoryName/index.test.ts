import { describe, it, expect } from 'vitest';
import { groupByCategoryName } from './index';
import type { ItemGroup } from '../../types';

function makeGroup(overrides: Partial<ItemGroup> = {}): ItemGroup {
  return {
    itemId: 'item-1',
    name: 'Flour',
    categoryType: 'food',
    categoryName: 'Bakery',
    entries: [],
    ...overrides,
  };
}

describe('groupByCategoryName', () => {
  it('groups items by their category name', () => {
    const groups = [
      makeGroup({ itemId: 'item-1', categoryName: 'Bakery' }),
      makeGroup({ itemId: 'item-2', categoryName: 'Dairy' }),
      makeGroup({ itemId: 'item-3', categoryName: 'Bakery' }),
    ];

    const result = groupByCategoryName(groups);
    const bakery = result.find(([name]) => name === 'Bakery');

    expect(bakery?.[1]).toHaveLength(2);
    expect(bakery?.[1].map((g) => g.itemId)).toEqual(['item-1', 'item-3']);
  });

  it('sorts the resulting sections by category name', () => {
    const groups = [
      makeGroup({ itemId: 'item-1', categoryName: 'Dairy' }),
      makeGroup({ itemId: 'item-2', categoryName: 'Bakery' }),
    ];

    const result = groupByCategoryName(groups);

    expect(result.map(([name]) => name)).toEqual(['Bakery', 'Dairy']);
  });

  it('falls back to an empty string key for items with no category name', () => {
    const groups = [makeGroup({ itemId: 'item-1', categoryName: undefined })];

    const result = groupByCategoryName(groups);

    expect(result).toEqual([['', [groups[0]]]]);
  });
});

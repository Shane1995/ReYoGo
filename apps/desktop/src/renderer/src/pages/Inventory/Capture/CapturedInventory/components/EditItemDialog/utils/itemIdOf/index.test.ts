import { describe, it, expect } from 'vitest';
import type { InventoryItem } from '../../../../types';
import { itemIdOf } from '.';

describe('itemIdOf', () => {
  it('returns null when item is null', () => {
    expect(itemIdOf(null)).toBeNull();
  });

  it('returns the item id', () => {
    const item: InventoryItem = {
      id: 'item-1',
      name: 'Tomatoes',
      categoryId: 'cat-1',
      type: 'food',
    };
    expect(itemIdOf(item)).toBe('item-1');
  });
});

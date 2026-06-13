import { describe, it, expect } from 'vitest';
import type { InventoryItem } from '../../../../types';
import { itemFieldDefaults } from '.';

describe('itemFieldDefaults', () => {
  it('returns empty defaults when item is null', () => {
    expect(itemFieldDefaults(null)).toEqual({ name: '', categoryId: '', unitOfMeasureId: '' });
  });

  it('returns the item field values', () => {
    const item: InventoryItem = {
      id: 'item-1',
      name: 'Tomatoes',
      categoryId: 'cat-1',
      type: 'food',
      unitOfMeasureId: 'unit-1',
    };
    expect(itemFieldDefaults(item)).toEqual({
      name: 'Tomatoes',
      categoryId: 'cat-1',
      unitOfMeasureId: 'unit-1',
    });
  });

  it('defaults unitOfMeasureId to an empty string when null', () => {
    const item: InventoryItem = {
      id: 'item-1',
      name: 'Tomatoes',
      categoryId: 'cat-1',
      type: 'food',
      unitOfMeasureId: null,
    };
    expect(itemFieldDefaults(item)).toEqual({
      name: 'Tomatoes',
      categoryId: 'cat-1',
      unitOfMeasureId: '',
    });
  });
});

import { describe, it, expect } from 'vitest';
import { enrichedTypeOf } from '.';
import type { InventoryItem } from '../../../../types';

function buildItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return { id: 'i1', name: 'Chips', categoryId: 'cat-1', type: '', ...overrides };
}

describe('enrichedTypeOf', () => {
  it('returns the item type when already set', () => {
    expect(enrichedTypeOf(buildItem({ type: 'Food' }), new Map())).toBe('Food');
  });

  it('falls back to the category type when item type is empty', () => {
    const categoryTypeMap = new Map([['cat-1', 'Beverage']]);
    expect(enrichedTypeOf(buildItem({ type: '' }), categoryTypeMap)).toBe('Beverage');
  });

  it('returns an empty string when neither item nor category has a type', () => {
    expect(enrichedTypeOf(buildItem({ type: '' }), new Map())).toBe('');
  });
});

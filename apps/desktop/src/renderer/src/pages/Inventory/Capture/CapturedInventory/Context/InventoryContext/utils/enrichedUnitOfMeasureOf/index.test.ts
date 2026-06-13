import { describe, it, expect } from 'vitest';
import { enrichedUnitOfMeasureOf } from '.';
import type { InventoryItem } from '../../../../types';

function buildItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return { id: 'i1', name: 'Chips', categoryId: 'cat-1', type: '', ...overrides };
}

describe('enrichedUnitOfMeasureOf', () => {
  it('returns the item unitOfMeasure when already set', () => {
    expect(enrichedUnitOfMeasureOf(buildItem({ unitOfMeasure: 'kg' }), new Map())).toBe('kg');
  });

  it('looks up the unit name from the unit map when unitOfMeasureId is set', () => {
    const unitMap = new Map([['u1', 'kg']]);
    expect(enrichedUnitOfMeasureOf(buildItem({ unitOfMeasureId: 'u1' }), unitMap)).toBe('kg');
  });

  it('returns undefined when there is no unit information', () => {
    expect(enrichedUnitOfMeasureOf(buildItem(), new Map())).toBeUndefined();
  });
});

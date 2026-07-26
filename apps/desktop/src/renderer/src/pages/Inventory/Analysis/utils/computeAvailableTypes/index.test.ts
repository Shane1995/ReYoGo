import { describe, it, expect } from 'vitest';
import { computeAvailableTypes } from '.';
import type { ItemGroup } from '../../types';

function group(categoryType: string): ItemGroup {
  return { itemId: categoryType, name: categoryType, categoryType, entries: [] };
}

describe('computeAvailableTypes', () => {
  it('orders known types by TYPE_ORDER', () => {
    const groups = [group('beverage'), group('food'), group('non-food')];
    expect(computeAvailableTypes(groups)).toEqual(['food', 'beverage', 'non-food']);
  });

  it('appends unknown types after the known ones', () => {
    const groups = [group('food'), group('custom-type')];
    expect(computeAvailableTypes(groups)).toEqual(['food', 'custom-type']);
  });

  it('deduplicates repeated types', () => {
    const groups = [group('food'), group('food')];
    expect(computeAvailableTypes(groups)).toEqual(['food']);
  });

  it('returns an empty array for no groups', () => {
    expect(computeAvailableTypes([])).toEqual([]);
  });
});

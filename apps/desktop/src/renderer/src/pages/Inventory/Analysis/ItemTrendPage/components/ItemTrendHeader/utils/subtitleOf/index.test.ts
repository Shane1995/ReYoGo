import { describe, it, expect } from 'vitest';
import { subtitleOf } from '.';
import type { ItemGroup } from '../../../../../types';
import type { Stats } from '../../../../types';

const baseGroup: ItemGroup = {
  itemId: 'item-1',
  name: 'Olive Oil',
  uom: 'L',
  categoryType: 'food',
  categoryName: 'Pantry',
  entries: [],
};

const baseStats: Stats = {
  min: 1,
  max: 3,
  avg: 2,
  first: 1,
  last: 3,
  change: 200,
  count: 2,
  uom: 'L',
};

describe('subtitleOf', () => {
  it('returns just the category name when stats is null', () => {
    expect(subtitleOf(baseGroup, null)).toBe('Pantry');
  });

  it('falls back to categoryType when categoryName is missing', () => {
    expect(subtitleOf({ ...baseGroup, categoryName: undefined }, null)).toBe('food');
  });

  it('appends uom and capture count when stats is present', () => {
    expect(subtitleOf(baseGroup, baseStats)).toBe('Pantry · L · 2 captures');
  });

  it('omits the uom segment when stats has no uom', () => {
    expect(subtitleOf(baseGroup, { ...baseStats, uom: undefined, count: 1 })).toBe(
      'Pantry · 1 capture',
    );
  });
});

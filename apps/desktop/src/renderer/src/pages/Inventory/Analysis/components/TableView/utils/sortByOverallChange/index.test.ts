import { describe, it, expect } from 'vitest';
import { sortByOverallChange } from './index';
import type { ItemGroup, ItemEntry } from '../../../../types';

function makeEntry(unitPriceInclVat: number): ItemEntry {
  return {
    invoiceId: 'inv-1',
    date: new Date('2026-01-01'),
    quantity: 1,
    unitPrice: unitPriceInclVat - 1,
    unitPriceInclVat,
  };
}

function makeGroup(entries: ItemEntry[]): ItemGroup {
  return {
    itemId: 'item-1',
    name: 'Item',
    categoryType: 'food',
    entries,
  };
}

describe('sortByOverallChange', () => {
  it('returns a negative number when a has a smaller overall change than b', () => {
    const a = makeGroup([makeEntry(100), makeEntry(110)]);
    const b = makeGroup([makeEntry(100), makeEntry(150)]);
    expect(sortByOverallChange(a, b)).toBeLessThan(0);
  });

  it('returns a positive number when a has a larger overall change than b', () => {
    const a = makeGroup([makeEntry(100), makeEntry(150)]);
    const b = makeGroup([makeEntry(100), makeEntry(110)]);
    expect(sortByOverallChange(a, b)).toBeGreaterThan(0);
  });

  it('sorts groups with no computable change after groups with a change', () => {
    const a = makeGroup([makeEntry(100)]);
    const b = makeGroup([makeEntry(100), makeEntry(110)]);
    expect(sortByOverallChange(a, b)).toBeGreaterThan(0);
  });

  it('returns zero when both groups have no computable change', () => {
    const a = makeGroup([makeEntry(100)]);
    const b = makeGroup([makeEntry(200)]);
    expect(sortByOverallChange(a, b)).toBe(0);
  });
});

import { describe, it, expect } from 'vitest';
import { sortByLastUnitPrice } from './index';
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

describe('sortByLastUnitPrice', () => {
  it('returns a negative number when a has a lower last unit price than b', () => {
    const a = makeGroup([makeEntry(10)]);
    const b = makeGroup([makeEntry(20)]);
    expect(sortByLastUnitPrice(a, b)).toBeLessThan(0);
  });

  it('returns a positive number when a has a higher last unit price than b', () => {
    const a = makeGroup([makeEntry(20)]);
    const b = makeGroup([makeEntry(10)]);
    expect(sortByLastUnitPrice(a, b)).toBeGreaterThan(0);
  });

  it('returns zero when last unit prices are equal', () => {
    const a = makeGroup([makeEntry(10)]);
    const b = makeGroup([makeEntry(10)]);
    expect(sortByLastUnitPrice(a, b)).toBe(0);
  });
});

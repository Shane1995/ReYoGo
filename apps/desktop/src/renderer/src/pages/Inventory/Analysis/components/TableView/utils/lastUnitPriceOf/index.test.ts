import { describe, it, expect } from 'vitest';
import { lastUnitPriceOf } from './index';
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

describe('lastUnitPriceOf', () => {
  it('returns the unitPriceInclVat of the last entry', () => {
    const group = makeGroup([makeEntry(10), makeEntry(15)]);
    expect(lastUnitPriceOf(group)).toBe(15);
  });

  it('returns zero when the group has no entries', () => {
    expect(lastUnitPriceOf(makeGroup([]))).toBe(0);
  });
});

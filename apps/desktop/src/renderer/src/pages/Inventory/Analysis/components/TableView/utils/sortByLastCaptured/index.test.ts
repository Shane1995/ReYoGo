import { describe, it, expect } from 'vitest';
import { sortByLastCaptured } from './index';
import type { ItemGroup, ItemEntry } from '../../../../types';

function makeEntry(date: Date): ItemEntry {
  return {
    invoiceId: 'inv-1',
    date,
    quantity: 1,
    unitPrice: 10,
    unitPriceInclVat: 11,
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

describe('sortByLastCaptured', () => {
  it('returns a negative number when a was last captured before b', () => {
    const a = makeGroup([makeEntry(new Date('2026-01-01'))]);
    const b = makeGroup([makeEntry(new Date('2026-02-01'))]);
    expect(sortByLastCaptured(a, b)).toBeLessThan(0);
  });

  it('returns a positive number when a was last captured after b', () => {
    const a = makeGroup([makeEntry(new Date('2026-02-01'))]);
    const b = makeGroup([makeEntry(new Date('2026-01-01'))]);
    expect(sortByLastCaptured(a, b)).toBeGreaterThan(0);
  });

  it('treats groups with no entries as the earliest possible date', () => {
    const a = makeGroup([]);
    const b = makeGroup([makeEntry(new Date('2026-01-01'))]);
    expect(sortByLastCaptured(a, b)).toBeLessThan(0);
  });

  it('returns zero when both groups have no entries', () => {
    expect(sortByLastCaptured(makeGroup([]), makeGroup([]))).toBe(0);
  });
});

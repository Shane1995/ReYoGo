import { describe, it, expect } from 'vitest';
import { prevInclVatOf } from './index';
import type { ItemEntry } from '../../../../../../types';

function makeEntry(unitPriceInclVat: number): ItemEntry {
  return {
    invoiceId: 'inv-1',
    date: new Date('2026-01-01'),
    quantity: 1,
    unitPrice: unitPriceInclVat - 1,
    unitPriceInclVat,
  };
}

describe('prevInclVatOf', () => {
  it('returns null for the first entry', () => {
    const entries = [makeEntry(10), makeEntry(20)];
    expect(prevInclVatOf(entries, 0)).toBeNull();
  });

  it('returns the unitPriceInclVat of the previous entry', () => {
    const entries = [makeEntry(10), makeEntry(20)];
    expect(prevInclVatOf(entries, 1)).toBe(10);
  });

  it('returns null when the index is negative', () => {
    const entries = [makeEntry(10)];
    expect(prevInclVatOf(entries, -1)).toBeNull();
  });
});

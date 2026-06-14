import { describe, it, expect } from 'vitest';
import { prevPriceOf } from '.';
import type { ItemGroup } from '../../../../../types';

const entries: ItemGroup['entries'] = [
  {
    invoiceId: 'inv-1',
    date: new Date('2026-01-01'),
    quantity: 2,
    unitPrice: 10,
    unitPriceInclVat: 10,
  },
  {
    invoiceId: 'inv-2',
    date: new Date('2026-02-01'),
    quantity: 3,
    unitPrice: 12,
    unitPriceInclVat: 12,
  },
];

describe('prevPriceOf', () => {
  it('returns null for the first entry', () => {
    expect(prevPriceOf(entries, 0)).toBeNull();
  });

  it('returns the previous entry unitPrice', () => {
    expect(prevPriceOf(entries, 1)).toBe(10);
  });

  it('returns null for a negative index', () => {
    expect(prevPriceOf(entries, -1)).toBeNull();
  });
});

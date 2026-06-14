import { describe, it, expect } from 'vitest';
import { overallChangePct, groupStats } from './index';
import type { ItemGroup } from '../../types';

function makeGroup(unitPrices: number[]): ItemGroup {
  return {
    itemId: 'item-1',
    name: 'Flour',
    categoryType: 'food',
    entries: unitPrices.map((unitPriceInclVat) => ({
      invoiceId: 'inv1',
      date: new Date('2025-01-01'),
      quantity: 1,
      unitPrice: unitPriceInclVat,
      unitPriceInclVat,
    })),
  };
}

describe('overallChangePct', () => {
  it('returns null when there is only one entry', () => {
    expect(overallChangePct(makeGroup([10]))).toBeNull();
  });

  it('returns null when the first entry price is zero', () => {
    expect(overallChangePct(makeGroup([0, 10]))).toBeNull();
  });

  it('returns the percentage change between the first and last entries', () => {
    expect(overallChangePct(makeGroup([10, 12]))).toBeCloseTo(20);
  });

  it('returns a negative percentage when the price decreases', () => {
    expect(overallChangePct(makeGroup([10, 8]))).toBeCloseTo(-20);
  });
});

describe('groupStats', () => {
  it('returns null avgChange when no group has a computable change', () => {
    const stats = groupStats([makeGroup([10])]);
    expect(stats).toEqual({ count: 1, avgChange: null, increased: 0, decreased: 0 });
  });

  it('aggregates counts, increases and decreases across groups', () => {
    const stats = groupStats([makeGroup([10, 12]), makeGroup([10, 8]), makeGroup([10])]);
    expect(stats.count).toBe(3);
    expect(stats.increased).toBe(1);
    expect(stats.decreased).toBe(1);
    expect(stats.avgChange).toBeCloseTo(0);
  });
});

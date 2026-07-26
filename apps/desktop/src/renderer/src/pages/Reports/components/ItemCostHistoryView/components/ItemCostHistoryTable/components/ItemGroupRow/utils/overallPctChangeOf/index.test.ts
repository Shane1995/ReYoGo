import { describe, it, expect } from 'vitest';
import { overallPctChangeOf } from '.';
import type { ItemCostHistoryRow } from '../../../../../../types';

function row(unitCostExclVat: number): ItemCostHistoryRow {
  return {
    itemId: 'item-1',
    itemName: 'Flour',
    invoiceId: 'inv-1',
    date: new Date('2026-01-01'),
    quantity: 1,
    unitCostExclVat,
    unitCostInclVat: unitCostExclVat,
    isVatable: false,
    pctChange: null,
    flagged: false,
  };
}

describe('overallPctChangeOf', () => {
  it('returns null for a single row', () => {
    expect(overallPctChangeOf([row(10)])).toBeNull();
  });

  it('returns the percentage change between the first and last row', () => {
    expect(overallPctChangeOf([row(10), row(11), row(12)])).toBeCloseTo(20);
  });

  it('returns null for an empty array', () => {
    expect(overallPctChangeOf([])).toBeNull();
  });
});

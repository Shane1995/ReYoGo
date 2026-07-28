import { describe, it, expect } from 'vitest';
import { reconcileScannedTotal } from './index';

describe('reconcileScannedTotal', () => {
  it('returns null when no invoice total was extracted', () => {
    expect(reconcileScannedTotal([{ quantity: 1, unitPrice: 10 }], null)).toBeNull();
  });

  it('returns null when the lines sum to the invoice total', () => {
    const lines = [
      { quantity: 2, unitPrice: 5 },
      { quantity: 1, unitPrice: 10 },
    ];
    expect(reconcileScannedTotal(lines, 20)).toBeNull();
  });

  it('returns null for a small rounding difference within tolerance', () => {
    const lines = [{ quantity: 3, unitPrice: 3.333 }];
    expect(reconcileScannedTotal(lines, 10)).toBeNull();
  });

  it('flags a real mismatch between the line sum and the invoice total', () => {
    const lines = [
      { quantity: 2, unitPrice: 5 },
      { quantity: 1, unitPrice: 10 },
    ];
    expect(reconcileScannedTotal(lines, 50)).toEqual({
      computedTotal: 20,
      invoiceTotal: 50,
      difference: -30,
    });
  });

  it('flags when the computed total exceeds the invoice total', () => {
    expect(reconcileScannedTotal([{ quantity: 5, unitPrice: 10 }], 40)).toEqual({
      computedTotal: 50,
      invoiceTotal: 40,
      difference: 10,
    });
  });
});

import { describe, it, expect } from 'vitest';
import { lineNeedsReview } from './index';

const baseLine = {
  id: '1',
  itemId: 'item-1',
  quantity: 1,
  isVatable: true,
  totalVatExclude: 10,
};

describe('lineNeedsReview', () => {
  it('is false when no review flags are set', () => {
    expect(lineNeedsReview(baseLine)).toBe(false);
  });

  it('is true when the item is unmatched', () => {
    expect(lineNeedsReview({ ...baseLine, needsReview: true })).toBe(true);
  });

  it('is true when the quantity confidence was low', () => {
    expect(lineNeedsReview({ ...baseLine, quantityNeedsReview: true })).toBe(true);
  });

  it('is true when the price confidence was low', () => {
    expect(lineNeedsReview({ ...baseLine, totalNeedsReview: true })).toBe(true);
  });

  it('is true when the tax-exempt flag needs confirming', () => {
    expect(lineNeedsReview({ ...baseLine, taxNeedsReview: true })).toBe(true);
  });
});

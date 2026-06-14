import { describe, it, expect } from 'vitest';
import { avgPriceOf } from '.';
import type { Stats } from '../../types';

const baseStats: Stats = {
  min: 1,
  max: 3,
  avg: 2,
  first: 1,
  last: 3,
  change: 200,
  count: 2,
  uom: 'kg',
};

describe('avgPriceOf', () => {
  it('returns the average price from stats', () => {
    expect(avgPriceOf(baseStats)).toBe(2);
  });

  it('returns 0 when stats is null', () => {
    expect(avgPriceOf(null)).toBe(0);
  });
});

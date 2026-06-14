import { describe, it, expect } from 'vitest';
import { captureCountLabel } from '.';
import type { Stats } from '../../../../types';

const baseStats: Stats = {
  min: 1,
  max: 3,
  avg: 2,
  first: 1,
  last: 3,
  change: 200,
  count: 1,
  uom: undefined,
};

describe('captureCountLabel', () => {
  it('uses the singular form for a single capture', () => {
    expect(captureCountLabel(baseStats)).toBe('1 capture');
  });

  it('uses the plural form for multiple captures', () => {
    expect(captureCountLabel({ ...baseStats, count: 3 })).toBe('3 captures');
  });

  it('uses the plural form for zero captures', () => {
    expect(captureCountLabel({ ...baseStats, count: 0 })).toBe('0 captures');
  });
});

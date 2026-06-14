import { describe, it, expect } from 'vitest';
import { uomOf } from '.';
import type { Stats } from '../../../../types';

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

describe('uomOf', () => {
  it('returns the uom from stats', () => {
    expect(uomOf(baseStats)).toBe('kg');
  });

  it('returns undefined when stats has no uom', () => {
    expect(uomOf({ ...baseStats, uom: undefined })).toBeUndefined();
  });

  it('returns undefined when stats is null', () => {
    expect(uomOf(null)).toBeUndefined();
  });
});

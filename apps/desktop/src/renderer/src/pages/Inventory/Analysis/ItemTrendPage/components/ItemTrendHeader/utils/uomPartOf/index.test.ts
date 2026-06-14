import { describe, it, expect } from 'vitest';
import { uomPartOf } from '.';
import type { Stats } from '../../../../types';

const baseStats: Stats = {
  min: 1,
  max: 3,
  avg: 2,
  first: 1,
  last: 3,
  change: 200,
  count: 2,
  uom: undefined,
};

describe('uomPartOf', () => {
  it('returns an empty string when stats has no uom', () => {
    expect(uomPartOf(baseStats)).toBe('');
  });

  it('returns the uom prefixed with a separator when present', () => {
    expect(uomPartOf({ ...baseStats, uom: 'kg' })).toBe(' · kg');
  });
});

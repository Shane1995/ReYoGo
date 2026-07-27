import { describe, it, expect } from 'vitest';
import { roundTo } from '.';

describe('roundTo', () => {
  it('rounds a repeating decimal to 2 places', () => {
    expect(roundTo(11.9208333333333, 2)).toBe(11.92);
  });

  it('rounds a repeating decimal to 1 place', () => {
    expect(roundTo(0.00000004, 1)).toBe(0);
  });

  it('leaves an already-clean value unchanged', () => {
    expect(roundTo(11.5, 2)).toBe(11.5);
  });

  it('rounds negative values correctly', () => {
    expect(roundTo(-5.455, 2)).toBe(-5.45);
  });
});

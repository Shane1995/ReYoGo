import { describe, it, expect } from 'vitest';
import { calculateWAC } from '.';

describe('calculateWAC', () => {
  it('returns the unit cost directly when there is no prior stock', () => {
    expect(calculateWAC(0, null, 10, 5.0)).toBe(5.0);
  });

  it('blends costs proportionally across two purchases', () => {
    expect(calculateWAC(10, 10.0, 10, 20.0)).toBe(15.0);
  });

  it('rounds to 4 decimal places', () => {
    expect(calculateWAC(10, 10.0, 5, 7.0)).toBe(9.0);
  });

  it('handles fractional quantities correctly', () => {
    expect(calculateWAC(2, 5.0, 1, 8.0)).toBe(6.0);
  });

  it('returns 0 when both previous and incoming quantities are zero', () => {
    expect(calculateWAC(0, null, 0, 5.0)).toBe(0);
  });

  it('uses the new unit cost when prevWac is null but prevQty is positive', () => {
    expect(calculateWAC(5, null, 5, 10.0)).toBe(10.0);
  });
});

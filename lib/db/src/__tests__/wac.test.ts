import { describe, it, expect } from 'vitest';
import { calculateWAC } from '../utils/wac';

describe('calculateWAC', () => {
  it('returns unitCost directly when prevQty is zero', () => {
    expect(calculateWAC(0, null, 10, 5.0)).toBe(5.0);
  });

  it('blends costs proportionally', () => {
    // 10 units @ 10.00, add 10 units @ 20.00 → WAC = 15.00
    expect(calculateWAC(10, 10.0, 10, 20.0)).toBe(15.0);
  });

  it('rounds to 4 decimal places', () => {
    // 10 @ 10.00, add 5 @ 7.00 → (100 + 35) / 15 = 9.0000
    expect(calculateWAC(10, 10.0, 5, 7.0)).toBe(9.0);
  });

  it('handles fractional WAC correctly', () => {
    // 2 @ 5.00, add 1 @ 8.00 → (10 + 8) / 3 = 6.0000
    expect(calculateWAC(2, 5.0, 1, 8.0)).toBe(6.0);
  });

  it('returns 0 when total stock after would be 0', () => {
    expect(calculateWAC(0, null, 0, 5.0)).toBe(0);
  });
});

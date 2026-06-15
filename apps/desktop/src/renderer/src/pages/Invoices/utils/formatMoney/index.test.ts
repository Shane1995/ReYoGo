import { describe, expect, it } from 'vitest';
import { formatMoney } from './index';

describe('formatMoney', () => {
  it('formats whole numbers with two decimal places', () => {
    expect(formatMoney(5)).toBe('5.00');
  });

  it('rounds to two decimal places', () => {
    expect(formatMoney(5.125)).toBe('5.13');
  });

  it('formats zero', () => {
    expect(formatMoney(0)).toBe('0.00');
  });

  it('formats negative numbers', () => {
    expect(formatMoney(-2.5)).toBe('-2.50');
  });
});

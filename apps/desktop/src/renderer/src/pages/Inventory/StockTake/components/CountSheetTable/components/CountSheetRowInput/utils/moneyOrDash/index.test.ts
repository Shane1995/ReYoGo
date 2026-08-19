import { describe, it, expect } from 'vitest';
import { moneyOrDash } from '.';

describe('moneyOrDash', () => {
  it('formats a known value as currency', () => {
    expect(moneyOrDash(4.5)).toBe('R 4,50');
  });

  it('returns an em dash for null', () => {
    expect(moneyOrDash(null)).toBe('—');
  });
});

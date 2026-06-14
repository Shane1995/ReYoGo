import { describe, it, expect } from 'vitest';
import { pctChangeOf } from './index';

describe('pctChangeOf', () => {
  it('returns null when prev is null', () => {
    expect(pctChangeOf(10, null)).toBeNull();
  });

  it('returns null when prev is zero', () => {
    expect(pctChangeOf(10, 0)).toBeNull();
  });

  it('returns null when prev is negative', () => {
    expect(pctChangeOf(10, -5)).toBeNull();
  });

  it('returns the percentage increase when current is greater than prev', () => {
    expect(pctChangeOf(120, 100)).toBe(20);
  });

  it('returns the percentage decrease when current is less than prev', () => {
    expect(pctChangeOf(80, 100)).toBe(-20);
  });

  it('returns zero when current equals prev', () => {
    expect(pctChangeOf(100, 100)).toBe(0);
  });
});

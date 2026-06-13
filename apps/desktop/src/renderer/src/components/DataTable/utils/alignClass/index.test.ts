import { describe, it, expect } from 'vitest';
import { alignClass } from '.';

describe('alignClass', () => {
  it('returns the right-align class', () => {
    expect(alignClass('right')).toBe('text-right');
  });

  it('returns the center-align class', () => {
    expect(alignClass('center')).toBe('text-center');
  });

  it('returns the left-align class for "left"', () => {
    expect(alignClass('left')).toBe('text-left');
  });

  it('defaults to the left-align class when unset', () => {
    expect(alignClass(undefined)).toBe('text-left');
  });
});

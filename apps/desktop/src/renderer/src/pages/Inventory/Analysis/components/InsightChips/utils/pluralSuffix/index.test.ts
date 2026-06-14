import { describe, it, expect } from 'vitest';
import { pluralSuffix } from './index';

describe('pluralSuffix', () => {
  it('returns an empty string for a count of one', () => {
    expect(pluralSuffix(1)).toBe('');
  });

  it('returns "s" for a count of zero', () => {
    expect(pluralSuffix(0)).toBe('s');
  });

  it('returns "s" for a count greater than one', () => {
    expect(pluralSuffix(2)).toBe('s');
  });
});

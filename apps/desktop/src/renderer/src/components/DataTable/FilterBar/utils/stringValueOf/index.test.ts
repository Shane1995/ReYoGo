import { describe, it, expect } from 'vitest';
import { stringValueOf } from '.';

describe('stringValueOf', () => {
  it('returns the string value for the key', () => {
    expect(stringValueOf({ search: 'abc' }, 'search')).toBe('abc');
  });

  it('returns an empty string when the value is an array', () => {
    expect(stringValueOf({ tags: ['a'] }, 'tags')).toBe('');
  });

  it('returns an empty string when the key is missing', () => {
    expect(stringValueOf({}, 'search')).toBe('');
  });
});

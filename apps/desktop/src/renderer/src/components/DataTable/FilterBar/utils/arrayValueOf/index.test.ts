import { describe, it, expect } from 'vitest';
import { arrayValueOf } from '.';

describe('arrayValueOf', () => {
  it('returns the array value for the key', () => {
    expect(arrayValueOf({ tags: ['a', 'b'] }, 'tags')).toEqual(['a', 'b']);
  });

  it('returns an empty array when the value is a string', () => {
    expect(arrayValueOf({ search: 'abc' }, 'search')).toEqual([]);
  });

  it('returns an empty array when the key is missing', () => {
    expect(arrayValueOf({}, 'tags')).toEqual([]);
  });
});

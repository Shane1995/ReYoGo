import { describe, it, expect } from 'vitest';
import { toggleSetMember } from './index';

describe('toggleSetMember', () => {
  it('adds the key when it is not present in the set', () => {
    const result = toggleSetMember(new Set(), 'foo');
    expect(result.has('foo')).toBe(true);
  });

  it('removes the key when it is already present in the set', () => {
    const result = toggleSetMember(new Set(['foo']), 'foo');
    expect(result.has('foo')).toBe(false);
  });

  it('does not mutate the original set', () => {
    const original = new Set(['foo']);
    toggleSetMember(original, 'bar');
    expect(original.has('bar')).toBe(false);
  });

  it('leaves other members untouched when toggling a key', () => {
    const result = toggleSetMember(new Set(['foo', 'bar']), 'foo');
    expect(result.has('bar')).toBe(true);
    expect(result.has('foo')).toBe(false);
  });
});

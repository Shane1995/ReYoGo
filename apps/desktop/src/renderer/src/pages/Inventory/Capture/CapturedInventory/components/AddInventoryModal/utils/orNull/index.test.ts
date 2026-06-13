import { describe, it, expect } from 'vitest';
import { orNull } from '.';

describe('orNull', () => {
  it('returns null for an empty string', () => {
    expect(orNull('')).toBeNull();
  });

  it('returns the value when non-empty', () => {
    expect(orNull('kg')).toBe('kg');
  });
});

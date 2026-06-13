import { describe, it, expect } from 'vitest';
import { isSyncActive } from '.';

describe('isSyncActive', () => {
  it('returns false for null', () => {
    expect(isSyncActive(null)).toBe(false);
  });

  it('returns false when isActive is false', () => {
    expect(isSyncActive({ isActive: false, lastSyncedAt: null, state: 'idle', error: null })).toBe(
      false,
    );
  });

  it('returns true when isActive is true', () => {
    expect(isSyncActive({ isActive: true, lastSyncedAt: null, state: 'idle', error: null })).toBe(
      true,
    );
  });
});

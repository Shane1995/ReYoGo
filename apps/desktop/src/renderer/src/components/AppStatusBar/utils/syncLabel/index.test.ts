import { describe, it, expect } from 'vitest';
import { syncLabel } from '.';

describe('syncLabel', () => {
  it('returns "Local only" when sync is not active', () => {
    expect(syncLabel(null, false, true)).toBe('Local only');
    expect(
      syncLabel({ isActive: false, lastSyncedAt: null, state: 'idle', error: null }, false, true),
    ).toBe('Local only');
  });

  it('delegates to activeSyncLabel when sync is active', () => {
    expect(
      syncLabel({ isActive: true, lastSyncedAt: null, state: 'idle', error: null }, false, true),
    ).toBe('Connected');
  });
});

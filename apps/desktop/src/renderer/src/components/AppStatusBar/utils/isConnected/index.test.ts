import { describe, it, expect } from 'vitest';
import { isConnected } from '.';

const activeSync = { isActive: true, lastSyncedAt: null, state: 'idle', error: null };

describe('isConnected', () => {
  it('returns false when sync is not active', () => {
    expect(isConnected(null, false, true)).toBe(false);
  });

  it('returns false when offline', () => {
    expect(isConnected(activeSync, false, false)).toBe(false);
  });

  it('returns false while syncing', () => {
    expect(isConnected(activeSync, true, true)).toBe(false);
  });

  it('returns false when sync state is error', () => {
    expect(isConnected({ ...activeSync, state: 'error' }, false, true)).toBe(false);
  });

  it('returns true when active, online, not syncing, and not errored', () => {
    expect(isConnected(activeSync, false, true)).toBe(true);
  });
});

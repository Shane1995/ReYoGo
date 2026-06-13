import { describe, it, expect } from 'vitest';
import { activeSyncLabel } from '.';

const sync = { isActive: true, lastSyncedAt: null, state: 'idle', error: null };

describe('activeSyncLabel', () => {
  it('returns "Offline" when not online', () => {
    expect(activeSyncLabel(sync, false, false)).toBe('Offline');
  });

  it('returns "Syncing…" when syncing', () => {
    expect(activeSyncLabel(sync, true, true)).toBe('Syncing…');
  });

  it('returns "Sync failed" when sync state is error', () => {
    expect(activeSyncLabel({ ...sync, state: 'error' }, false, true)).toBe('Sync failed');
  });

  it('returns "Connected" otherwise', () => {
    expect(activeSyncLabel(sync, false, true)).toBe('Connected');
  });
});

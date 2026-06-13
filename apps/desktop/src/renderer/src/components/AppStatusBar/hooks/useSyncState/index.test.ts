import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CloudSyncEventType } from '@shared/types/cloudSync';
import type { CloudSyncEvent } from '@shared/types/cloudSync';
import { useSyncState } from '.';

vi.mock('@/services/cloudSync', () => ({
  cloudSyncService: {
    getStatus: vi.fn(),
    onSyncEvent: vi.fn(),
  },
}));

import { cloudSyncService } from '@/services/cloudSync';

describe('useSyncState', () => {
  it('starts with no sync status and not syncing', () => {
    vi.mocked(cloudSyncService.getStatus).mockResolvedValue({
      isActive: false,
      lastSyncedAt: null,
      state: 'idle',
      error: null,
    });
    vi.mocked(cloudSyncService.onSyncEvent).mockReturnValue(() => {});

    const { result } = renderHook(() => useSyncState());

    expect(result.current.sync).toBeNull();
    expect(result.current.syncing).toBe(false);
  });

  it('loads sync status on mount', async () => {
    vi.mocked(cloudSyncService.getStatus).mockResolvedValue({
      isActive: true,
      lastSyncedAt: '2026-01-01T00:00:00.000Z',
      state: 'idle',
      error: null,
    });
    vi.mocked(cloudSyncService.onSyncEvent).mockReturnValue(() => {});

    const { result } = renderHook(() => useSyncState());

    await waitFor(() => {
      expect(result.current.sync).toEqual({
        isActive: true,
        lastSyncedAt: '2026-01-01T00:00:00.000Z',
        state: 'idle',
        error: null,
      });
    });
  });

  it('sets syncing true when a syncing event fires', async () => {
    vi.mocked(cloudSyncService.getStatus).mockResolvedValue({
      isActive: true,
      lastSyncedAt: null,
      state: 'idle',
      error: null,
    });
    let capturedCallback: ((event: CloudSyncEvent) => void) | undefined;
    vi.mocked(cloudSyncService.onSyncEvent).mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });

    const { result } = renderHook(() => useSyncState());

    act(() => {
      capturedCallback?.({ type: CloudSyncEventType.Syncing });
    });

    expect(result.current.syncing).toBe(true);
  });
});

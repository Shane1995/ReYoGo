import { describe, it, expect, vi } from 'vitest';
import { CloudSyncEventType, CloudSyncStage } from '@shared/types/cloudSync';
import { dispatchSyncStateEvent } from '.';

describe('dispatchSyncStateEvent', () => {
  it('sets syncing true on a syncing event without refreshing', () => {
    const setSyncing = vi.fn();
    const refresh = vi.fn();

    dispatchSyncStateEvent({ type: CloudSyncEventType.Syncing }, setSyncing, refresh);

    expect(setSyncing).toHaveBeenCalledWith(true);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('sets syncing false and refreshes on a success event', () => {
    const setSyncing = vi.fn();
    const refresh = vi.fn();

    dispatchSyncStateEvent({ type: CloudSyncEventType.Success }, setSyncing, refresh);

    expect(setSyncing).toHaveBeenCalledWith(false);
    expect(refresh).toHaveBeenCalled();
  });

  it('sets syncing false and refreshes on a background-sync event', () => {
    const setSyncing = vi.fn();
    const refresh = vi.fn();

    dispatchSyncStateEvent({ type: CloudSyncEventType.BackgroundSync }, setSyncing, refresh);

    expect(setSyncing).toHaveBeenCalledWith(false);
    expect(refresh).toHaveBeenCalled();
  });

  it('sets syncing false and refreshes on an error event', () => {
    const setSyncing = vi.fn();
    const refresh = vi.fn();

    dispatchSyncStateEvent(
      { type: CloudSyncEventType.Error, message: 'boom', retryable: true },
      setSyncing,
      refresh,
    );

    expect(setSyncing).toHaveBeenCalledWith(false);
    expect(refresh).toHaveBeenCalled();
  });

  it('does nothing for a progress event', () => {
    const setSyncing = vi.fn();
    const refresh = vi.fn();

    dispatchSyncStateEvent(
      { type: CloudSyncEventType.Progress, stage: CloudSyncStage.Pushing, done: 1, total: 2 },
      setSyncing,
      refresh,
    );

    expect(setSyncing).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });
});

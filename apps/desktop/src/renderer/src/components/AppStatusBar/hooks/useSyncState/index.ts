import { useEffect, useState } from 'react';
import { cloudSyncService } from '@/services/cloudSync';
import type { CloudSyncEvent } from '@shared/types/cloudSync';
import { dispatchSyncStateEvent } from '../../utils/dispatchSyncStateEvent';
import type { SyncStatus } from '../../types';
import type { UseSyncStateResult } from './types';

export function useSyncState(): UseSyncStateResult {
  const [sync, setSync] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const status = await cloudSyncService.getStatus().catch(() => null);
      if (active && status)
        setSync({
          isActive: status.isActive,
          lastSyncedAt: status.lastSyncedAt,
          state: status.state,
          error: status.error,
        });
    };
    refresh();
    const off = cloudSyncService.onSyncEvent((event: CloudSyncEvent) => {
      if (!active) return;
      dispatchSyncStateEvent(event, setSyncing, refresh);
    });
    return () => {
      active = false;
      off();
    };
  }, []);

  return { sync, syncing };
}

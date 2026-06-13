import { CloudSyncEventType } from '@shared/types/cloudSync';
import type { CloudSyncEvent } from '@shared/types/cloudSync';
import { REFRESH_EVENT_TYPES } from '../../constants';

export function dispatchSyncStateEvent(
  event: CloudSyncEvent,
  setSyncing: (v: boolean) => void,
  refresh: () => void,
): void {
  if (event.type === CloudSyncEventType.Syncing) {
    setSyncing(true);
    return;
  }
  if (REFRESH_EVENT_TYPES.includes(event.type)) {
    setSyncing(false);
    refresh();
  }
}

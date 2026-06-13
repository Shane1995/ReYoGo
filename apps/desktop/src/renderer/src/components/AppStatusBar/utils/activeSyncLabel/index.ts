import { SyncState } from '@shared/types/cloudSync';
import type { SyncStatus } from '../../types';

export function activeSyncLabel(sync: SyncStatus, syncing: boolean, isOnline: boolean): string {
  if (!isOnline) return 'Offline';
  if (syncing) return 'Syncing…';
  if (sync.state === SyncState.Error) return 'Sync failed';
  return 'Connected';
}

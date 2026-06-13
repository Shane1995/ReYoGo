import { isSyncActive } from '../isSyncActive';
import { activeSyncLabel } from '../activeSyncLabel';
import type { SyncStatus } from '../../types';

export function syncLabel(sync: SyncStatus | null, syncing: boolean, isOnline: boolean): string {
  if (!isSyncActive(sync)) return 'Local only';
  return activeSyncLabel(sync, syncing, isOnline);
}

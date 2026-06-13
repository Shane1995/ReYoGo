import { SyncState } from '@shared/types/cloudSync';
import { isSyncActive } from '../isSyncActive';
import type { SyncStatus } from '../../types';

export function isConnected(sync: SyncStatus | null, syncing: boolean, isOnline: boolean): boolean {
  if (!isSyncActive(sync)) return false;
  if (!isOnline) return false;
  if (syncing) return false;
  return sync.state !== SyncState.Error;
}

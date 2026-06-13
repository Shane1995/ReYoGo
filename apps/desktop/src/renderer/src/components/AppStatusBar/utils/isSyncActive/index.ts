import type { SyncStatus } from '../../types';

export function isSyncActive(sync: SyncStatus | null): sync is SyncStatus {
  return sync?.isActive === true;
}

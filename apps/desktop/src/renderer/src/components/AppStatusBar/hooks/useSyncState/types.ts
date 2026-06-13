import type { SyncStatus } from '../../types';

export type UseSyncStateResult = {
  sync: SyncStatus | null;
  syncing: boolean;
};

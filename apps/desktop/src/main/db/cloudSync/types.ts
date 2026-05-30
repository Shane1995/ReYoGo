import type { SyncState } from '@shared/types/cloudSync';

export type SyncStatus = {
  state: SyncState;
  lastSyncedAt: Date | null;
  error: string | null;
};

export type CloudSyncCredentials = {
  tursoUrl: string;
  authToken: string;
};

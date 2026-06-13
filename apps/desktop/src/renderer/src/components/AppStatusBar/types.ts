export type SyncStatus = {
  isActive: boolean;
  lastSyncedAt: string | null;
  state: string;
  error: string | null;
};

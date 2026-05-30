export type CloudSyncStatus = {
  state: string;
  lastSyncedAt: string | null;
  error: string | null;
  isActive: boolean;
};

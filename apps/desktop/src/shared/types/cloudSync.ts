export enum CloudSyncEventType {
  Progress = 'progress',
  Success = 'success',
  BackgroundSync = 'background-sync',
  Error = 'error',
}

export enum CloudSyncStage {
  Migrating = 'migrating',
  Pushing = 'pushing',
  Verifying = 'verifying',
  Activating = 'activating',
  Syncing = 'syncing',
}

export enum SyncState {
  Idle = 'idle',
  Syncing = 'syncing',
  Error = 'error',
}

export type CloudSyncEvent =
  | { type: CloudSyncEventType.Progress; stage: CloudSyncStage; done: number; total: number }
  | { type: CloudSyncEventType.Success }
  | { type: CloudSyncEventType.BackgroundSync }
  | { type: CloudSyncEventType.Error; message: string; retryable: boolean };

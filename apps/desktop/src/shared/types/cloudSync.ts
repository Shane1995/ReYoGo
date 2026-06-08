export enum CloudSyncEventType {
  Progress = 'progress',
  Success = 'success',
  Syncing = 'syncing',
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
  Error = 'error',
}

export type CloudSyncEvent =
  | { type: CloudSyncEventType.Progress; stage: CloudSyncStage; done: number; total: number }
  | { type: CloudSyncEventType.Success }
  | { type: CloudSyncEventType.Syncing }
  | { type: CloudSyncEventType.BackgroundSync }
  | { type: CloudSyncEventType.Error; message: string; retryable: boolean };

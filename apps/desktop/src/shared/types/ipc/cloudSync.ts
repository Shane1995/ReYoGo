export const CloudSyncIPC = {
  ACTIVATE: 'cloud-sync:activate',
  GET_STATUS: 'cloud-sync:get-status',
  MANUAL_SYNC: 'cloud-sync:manual-sync',
  DELETE_BACKUP: 'cloud-sync:delete-backup',
  GET_CREDENTIALS: 'cloud-sync:get-credentials',
  IS_FRESH_REPLICA: 'cloud-sync:is-fresh-replica',
} as const;

export type CloudSyncIPC = (typeof CloudSyncIPC)[keyof typeof CloudSyncIPC];

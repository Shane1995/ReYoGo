import { CloudSyncIPC } from '@shared/types/ipc';
import type { CloudSyncEvent } from '@shared/types/cloudSync';

const invoke = () => window.electronAPI.ipcRenderer.invoke;

export const cloudSyncService = {
  activate: (tursoUrl: string, authToken: string): Promise<void> =>
    invoke()(CloudSyncIPC.ACTIVATE, tursoUrl, authToken),

  getStatus: (): Promise<{
    state: string;
    lastSyncedAt: string | null;
    error: string | null;
    isActive: boolean;
  }> => invoke()(CloudSyncIPC.GET_STATUS),

  manualSync: (): Promise<void> => invoke()(CloudSyncIPC.MANUAL_SYNC),

  deleteBackup: (): Promise<void> => invoke()(CloudSyncIPC.DELETE_BACKUP),

  getCredentials: (): Promise<{ tursoUrl: string } | null> =>
    invoke()(CloudSyncIPC.GET_CREDENTIALS),

  isFreshReplica: (): Promise<boolean> => invoke()(CloudSyncIPC.IS_FRESH_REPLICA),

  rotateToken: (authToken: string): Promise<void> => invoke()(CloudSyncIPC.ROTATE_TOKEN, authToken),

  connect: (tursoUrl: string, authToken: string): Promise<void> =>
    invoke()(CloudSyncIPC.CONNECT, tursoUrl, authToken),

  onSyncEvent: (callback: (event: CloudSyncEvent) => void): (() => void) =>
    window.electronAPI.onCloudSyncEvent(callback),
};

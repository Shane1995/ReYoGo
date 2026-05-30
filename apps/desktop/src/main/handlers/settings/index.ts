import { ipcMain } from 'electron';
import Database from 'better-sqlite3';
import { CloudSyncIPC } from '@shared/types/ipc';
import { getLocalDbPath, getReplicaPath, reinitialise } from '../../db';
import {
  activateCloudSync,
  getSyncStatus,
  getStoredCredentials,
  getTursoUrl,
  hasCloudCredentials,
  deleteLocalBackup,
  recordSyncSuccess,
  scheduleErrorAfterTimeout,
} from '../../db/cloudSync';

export function registerSettingsHandlers(): void {
  ipcMain.handle(CloudSyncIPC.ACTIVATE, async (event, tursoUrl: string, authToken: string) => {
    const localDbPath = getLocalDbPath();
    const localSqliteDb = new Database(localDbPath, { readonly: true });
    try {
      await activateCloudSync(event.sender, localDbPath, localSqliteDb, tursoUrl, authToken);
    } finally {
      localSqliteDb.close();
    }
    await reinitialise(getReplicaPath(), tursoUrl, authToken);
  });

  ipcMain.handle(CloudSyncIPC.GET_STATUS, () => {
    const status = getSyncStatus();
    return {
      state: status.state,
      lastSyncedAt: status.lastSyncedAt?.toISOString() ?? null,
      error: status.error,
      isActive: hasCloudCredentials(),
    };
  });

  ipcMain.handle(CloudSyncIPC.MANUAL_SYNC, async () => {
    const credentials = getStoredCredentials();
    if (!credentials) throw new Error('Cloud sync is not active.');
    const cancel = scheduleErrorAfterTimeout();
    try {
      await reinitialise(getReplicaPath(), credentials.tursoUrl, credentials.authToken);
      recordSyncSuccess();
    } finally {
      cancel();
    }
  });

  ipcMain.handle(CloudSyncIPC.DELETE_BACKUP, () => {
    deleteLocalBackup(getLocalDbPath());
  });

  ipcMain.handle(CloudSyncIPC.GET_CREDENTIALS, () => {
    const tursoUrl = getTursoUrl();
    if (!tursoUrl) return null;
    return { tursoUrl };
  });
}

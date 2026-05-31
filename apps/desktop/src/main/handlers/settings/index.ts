import { ipcMain } from 'electron';
import { CloudSyncIPC } from '@shared/types/ipc';
import { getDb, getLocalDbPath, getReplicaPath, reinitialise, wipeReplicaFiles } from '../../db';
import {
  activateCloudSync,
  getSyncStatus,
  getStoredCredentials,
  getTursoUrl,
  hasCloudCredentials,
  hasLocalReplica,
  deleteLocalBackup,
  recordSyncSuccess,
  recordSyncError,
  updateStoredToken,
  withSyncTimeout,
} from '../../db/cloudSync';

export function registerSettingsHandlers(): void {
  ipcMain.handle(CloudSyncIPC.ACTIVATE, async (event, tursoUrl: string, authToken: string) => {
    const replicaPath = getReplicaPath();
    await activateCloudSync(event.sender, getDb(), tursoUrl, authToken);
    wipeReplicaFiles(replicaPath);
    reinitialise(replicaPath, tursoUrl, authToken)
      .then(() => deleteLocalBackup(getLocalDbPath()))
      .catch((err: unknown) => {
        console.error('[ReYoGo] Failed to hot-swap to replica after activation:', err);
      });
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
    try {
      await withSyncTimeout(
        reinitialise(getReplicaPath(), credentials.tursoUrl, credentials.authToken),
      );
      recordSyncSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      recordSyncError(msg);
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

  ipcMain.handle(
    CloudSyncIPC.IS_FRESH_REPLICA,
    () => hasCloudCredentials() && !hasLocalReplica(getReplicaPath()),
  );

  ipcMain.handle(CloudSyncIPC.ROTATE_TOKEN, async (_event, authToken: string) => {
    const tursoUrl = getTursoUrl();
    if (!tursoUrl) throw new Error('Cloud sync is not active.');
    try {
      await withSyncTimeout(reinitialise(getReplicaPath(), tursoUrl, authToken));
      updateStoredToken(authToken);
      recordSyncSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      recordSyncError(msg);
      throw err;
    }
  });
}

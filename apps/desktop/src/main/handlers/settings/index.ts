import { ipcMain } from 'electron';
import { randomUUID } from 'crypto';
import { join, dirname } from 'path';
import { CloudSyncIPC } from '@shared/types/ipc';
import { createReplicaClient } from '@reyogo/db';
import { getDb, getLocalDbPath, getReplicaPath, reinitialise, wipeReplicaFiles } from '../../db';
import {
  activateCloudSync,
  clearCredentials,
  getSyncStatus,
  getStoredCredentials,
  getTursoUrl,
  hasCloudCredentials,
  hasLocalReplica,
  deleteLocalBackup,
  recordSyncSuccess,
  recordSyncError,
  saveCredentials,
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

  ipcMain.handle(CloudSyncIPC.CONNECT, async (_event, tursoUrl: string, authToken: string) => {
    if (!tursoUrl.startsWith('libsql://')) {
      throw new Error('Invalid URL — must start with libsql://');
    }
    const probePath = join(dirname(getReplicaPath()), `probe-${randomUUID()}.db`);
    let handle;
    try {
      handle = createReplicaClient(probePath, tursoUrl, authToken);
      await withSyncTimeout(handle.sync());
    } catch (err) {
      handle?.close();
      wipeReplicaFiles(probePath);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('401') || msg.includes('auth')) {
        throw new Error('Authentication failed — check your auth token.');
      }
      if (msg.includes('404')) {
        throw new Error('Database not found — check your URL.');
      }
      throw new Error('Could not connect to the database. Check your URL and token.');
    }
    handle.close();
    wipeReplicaFiles(probePath);
    saveCredentials(tursoUrl, authToken);
    try {
      await reinitialise(getReplicaPath(), tursoUrl, authToken);
    } catch {
      clearCredentials();
      throw new Error('Could not initialise the database. Please try again.');
    }
  });

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

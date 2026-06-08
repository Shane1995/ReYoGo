import { ipcMain, type IpcMainInvokeEvent } from 'electron';
import { classifyConnectError, getErrorCode } from './classifyConnectError';
import { CloudSyncIPC } from '@shared/types/ipc';
import { CloudSyncEventType } from '@shared/types/cloudSync';
import { CLOUD_SYNC_EVENT_CHANNEL } from '@shared/ipc-events';
import {
  getDb,
  getLocalDbPath,
  getReplicaPath,
  reinitialiseNoSync,
  syncViaUtilityProcess,
  wipeReplicaFiles,
} from '../../db';
import {
  activateCloudSync,
  clearCredentials,
  getSyncStatus,
  getTursoUrl,
  hasCloudCredentials,
  hasLocalReplica,
  deleteLocalBackup,
  getStoredCredentials,
  recordSyncSuccess,
  recordSyncError,
  saveCredentials,
  updateStoredToken,
  withSyncTimeout,
  INITIAL_SYNC_TIMEOUT_MS,
} from '../../db/cloudSync';

async function syncNewConnection(
  replicaPath: string,
  tursoUrl: string,
  authToken: string,
): Promise<void> {
  await withSyncTimeout(
    syncViaUtilityProcess(replicaPath, tursoUrl, authToken),
    INITIAL_SYNC_TIMEOUT_MS,
  );
  await reinitialiseNoSync(replicaPath, tursoUrl, authToken);
}

function handleConnectFailure(replicaPath: string, err: unknown): never {
  clearCredentials();
  wipeReplicaFiles(replicaPath);
  console.error(`[ReYoGo] CONNECT failed (code=${getErrorCode(err)}):`, err);
  throw classifyConnectError(err);
}

async function handleConnect(tursoUrl: string, authToken: string): Promise<void> {
  if (!tursoUrl.startsWith('libsql://')) {
    throw new Error('Invalid URL — must start with libsql://');
  }
  const replicaPath = getReplicaPath();
  wipeReplicaFiles(replicaPath);
  saveCredentials(tursoUrl, authToken);
  try {
    await syncNewConnection(replicaPath, tursoUrl, authToken);
  } catch (err) {
    handleConnectFailure(replicaPath, err);
  }
}

function handleManualSync(event: IpcMainInvokeEvent): void {
  if (!hasCloudCredentials()) throw new Error('Cloud sync is not active.');
  const credentials = getStoredCredentials();
  if (!credentials) throw new Error('Cloud sync credentials not found.');
  event.sender.send(CLOUD_SYNC_EVENT_CHANNEL, { type: CloudSyncEventType.Syncing });
  syncViaUtilityProcess(getReplicaPath(), credentials.tursoUrl, credentials.authToken)
    .then(() => {
      recordSyncSuccess();
      event.sender.send(CLOUD_SYNC_EVENT_CHANNEL, { type: CloudSyncEventType.Success });
    })
    .catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      recordSyncError(msg);
      event.sender.send(CLOUD_SYNC_EVENT_CHANNEL, {
        type: CloudSyncEventType.Error,
        message: msg,
        retryable: true,
      });
    });
}

function handleRotateToken(event: IpcMainInvokeEvent, authToken: string): void {
  const tursoUrl = getTursoUrl();
  if (!tursoUrl) throw new Error('Cloud sync is not active.');
  event.sender.send(CLOUD_SYNC_EVENT_CHANNEL, { type: CloudSyncEventType.Syncing });
  syncViaUtilityProcess(getReplicaPath(), tursoUrl, authToken)
    .then(async () => {
      await reinitialiseNoSync(getReplicaPath(), tursoUrl, authToken);
      updateStoredToken(authToken);
      recordSyncSuccess();
      event.sender.send(CLOUD_SYNC_EVENT_CHANNEL, { type: CloudSyncEventType.Success });
    })
    .catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      recordSyncError(msg);
      event.sender.send(CLOUD_SYNC_EVENT_CHANNEL, {
        type: CloudSyncEventType.Error,
        message: msg,
        retryable: true,
      });
    });
}

export function registerSettingsHandlers(): void {
  ipcMain.handle(CloudSyncIPC.ACTIVATE, async (event, tursoUrl: string, authToken: string) => {
    const replicaPath = getReplicaPath();
    await activateCloudSync(event.sender, getDb(), tursoUrl, authToken);
    wipeReplicaFiles(replicaPath);
    syncViaUtilityProcess(replicaPath, tursoUrl, authToken)
      .then(() => reinitialiseNoSync(replicaPath, tursoUrl, authToken))
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

  ipcMain.handle(CloudSyncIPC.MANUAL_SYNC, (event) => handleManualSync(event));

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

  ipcMain.handle(CloudSyncIPC.CONNECT, (_event, tursoUrl: string, authToken: string) =>
    handleConnect(tursoUrl, authToken),
  );

  ipcMain.handle(CloudSyncIPC.ROTATE_TOKEN, (event, authToken: string) =>
    handleRotateToken(event, authToken),
  );
}

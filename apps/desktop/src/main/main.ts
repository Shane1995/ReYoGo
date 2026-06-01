import { app, BrowserWindow, ipcMain, net } from 'electron';
import { autoUpdater } from 'electron-updater';
import { join } from 'path';
import {
  DB_REQUEST_READY_CHANNEL,
  DB_INIT_ERROR_CHANNEL,
  DB_AUTH_ERROR_CHANNEL,
  DB_SETUP_NEEDED_CHANNEL,
  CLOUD_SYNC_EVENT_CHANNEL,
} from '@shared/ipc-events';
import { CloudSyncEventType } from '@shared/types/cloudSync';
import {
  getDbReadyChannel,
  initDatabase,
  isDbInitialized,
  repairUomLinksIfNeeded,
  syncNow,
  isReplicaMode,
  getReplicaPath,
  getLocalDbPath,
  wipeReplicaFiles,
} from './db';
import {
  hasCloudCredentials,
  recordSyncSuccess,
  recordSyncError,
  markOffline,
  clearCredentials,
  deleteLocalBackup,
  withSyncTimeout,
} from './db/cloudSync';
import { registerRoute } from './lib/electron-router-dom';
import { registerIPC } from './ipc';

const BACKGROUND_SYNC_INTERVAL_MS = 5 * 60 * 1000;
let _bgSyncing = false;

function broadcastToWindows(channel: string, payload: unknown): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) win.webContents.send(channel, payload);
  }
}

function isPermanentSyncError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('404') || msg.includes('401') || msg.includes('auth role not found');
}

async function runBackgroundSync(): Promise<void> {
  if (!isReplicaMode()) return;
  if (_bgSyncing) return;
  if (!net.isOnline()) return;
  _bgSyncing = true;
  try {
    broadcastToWindows(CLOUD_SYNC_EVENT_CHANNEL, { type: CloudSyncEventType.Syncing });
    await withSyncTimeout(syncNow());
    recordSyncSuccess();
    broadcastToWindows(CLOUD_SYNC_EVENT_CHANNEL, { type: CloudSyncEventType.BackgroundSync });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[ReYoGo] Background sync failed:', err);
    if (isPermanentSyncError(err)) {
      clearCredentials();
      wipeReplicaFiles(getReplicaPath());
      deleteLocalBackup(getLocalDbPath());
      broadcastToWindows(CLOUD_SYNC_EVENT_CHANNEL, {
        type: CloudSyncEventType.Error,
        message: 'Cloud database unreachable. Reconnect in Settings.',
        retryable: false,
      });
    } else {
      recordSyncError(msg);
      broadcastToWindows(CLOUD_SYNC_EVENT_CHANNEL, {
        type: CloudSyncEventType.Error,
        message: msg,
        retryable: true,
      });
    }
  } finally {
    _bgSyncing = false;
  }
}

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  window.once('ready-to-show', () => {
    window.show();
    if (isDev || process.env.ROYOGO_DEBUG === '1') {
      window.webContents.openDevTools();
    }
  });

  window.webContents.on('did-fail-load', (_event, code, errDesc, url) => {
    console.error('[ReYoGo] Failed to load:', code, errDesc, url);
  });

  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  const htmlPath = app.isPackaged
    ? join(app.getAppPath(), 'out', 'renderer', 'index.html')
    : join(__dirname, '../../out/renderer/index.html');

  registerRoute({
    id: 'main',
    browserWindow: window,
    htmlFile: htmlPath,
  });

  return window;
}

app.whenReady().then(() => {
  registerIPC();
  createWindow();

  if (app.isPackaged) {
    autoUpdater.checkForUpdates();
  }

  let dbReady = false;
  let dbSetupNeeded = false;
  let dbError: string | null = null;
  let dbAuthError: string | null = null;
  let bgSyncStarted = false;
  let pendingSender: Electron.WebContents | null = null;

  const startBackgroundSync = () => {
    if (bgSyncStarted || !isReplicaMode()) return;
    bgSyncStarted = true;
    const interval = setInterval(runBackgroundSync, BACKGROUND_SYNC_INTERVAL_MS);
    app.once('will-quit', () => clearInterval(interval));
    app.on('browser-window-focus', runBackgroundSync);
  };

  const onDbReady = () => {
    if (isReplicaMode() && !net.isOnline()) markOffline();
    dbReady = true;
    dbSetupNeeded = false;
    trySendDbReady();
    repairUomLinksIfNeeded().catch((err) => {
      console.error('[ReYoGo] UoM repair failed:', err);
    });
    startBackgroundSync();
  };

  const trySendDbReady = () => {
    if (!pendingSender || pendingSender.isDestroyed()) return;

    const signal: [string, string?] | null =
      dbAuthError !== null
        ? [DB_AUTH_ERROR_CHANNEL, dbAuthError]
        : dbError !== null
          ? [DB_INIT_ERROR_CHANNEL, dbError]
          : dbReady
            ? [getDbReadyChannel()]
            : dbSetupNeeded
              ? [DB_SETUP_NEEDED_CHANNEL]
              : null;

    if (!signal) return;
    pendingSender.send(...signal);
    pendingSender = null;
  };

  ipcMain.on(DB_REQUEST_READY_CHANNEL, (event) => {
    pendingSender = event.sender;
    // Renderer reloaded after wizard connect — reinitialise() already ran, signal ready
    if (!dbReady && isDbInitialized()) {
      onDbReady();
      return;
    }
    trySendDbReady();
  });

  if (!hasCloudCredentials()) {
    dbSetupNeeded = true;
    trySendDbReady();
  } else {
    initDatabase()
      .then(onDbReady)
      .catch((err) => {
        console.error('[ReYoGo] Failed to initialize database:', err);
        const isAuthError = (err as { isCloudAuthError?: boolean }).isCloudAuthError === true;
        if (isAuthError) {
          // initDatabase already cleared credentials — treat as setup needed so the
          // wizard appears and the user can reconnect with a fresh token.
          dbSetupNeeded = true;
        } else {
          dbError = err instanceof Error ? err.message : String(err);
        }
        trySendDbReady();
      });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

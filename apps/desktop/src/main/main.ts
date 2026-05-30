import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import { join } from 'path';
import {
  DB_REQUEST_READY_CHANNEL,
  DB_INIT_ERROR_CHANNEL,
  CLOUD_SYNC_EVENT_CHANNEL,
} from '@shared/ipc-events';
import { CloudSyncEventType } from '@shared/types/cloudSync';
import {
  getDbReadyChannel,
  initDatabase,
  syncNow,
  isReplicaMode,
  getReplicaPath,
  wipeReplicaFiles,
} from './db';
import { recordSyncSuccess, recordSyncError, clearCredentials } from './db/cloudSync';
import { registerRoute } from './lib/electron-router-dom';
import { registerIPC } from './ipc';

const BACKGROUND_SYNC_INTERVAL_MS = 5 * 60 * 1000;

function broadcastToWindows(channel: string, payload: unknown): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) win.webContents.send(channel, payload);
  }
}

function isPermanentSyncError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('404') || msg.includes('auth role not found') || msg.includes('401');
}

async function runBackgroundSync(): Promise<void> {
  if (!isReplicaMode()) return;
  try {
    broadcastToWindows(CLOUD_SYNC_EVENT_CHANNEL, { type: CloudSyncEventType.Syncing });
    await syncNow();
    recordSyncSuccess();
    broadcastToWindows(CLOUD_SYNC_EVENT_CHANNEL, { type: CloudSyncEventType.BackgroundSync });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[ReYoGo] Background sync failed:', err);
    if (isPermanentSyncError(err)) {
      clearCredentials();
      wipeReplicaFiles(getReplicaPath());
      broadcastToWindows(CLOUD_SYNC_EVENT_CHANNEL, {
        type: CloudSyncEventType.Error,
        message: 'Cloud database unreachable. Reconnect in Settings.',
        retryable: false,
      });
    } else {
      recordSyncError(msg);
    }
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
      // Note: "ReferenceError: dragEvent is not defined" in console is a known Chrome DevTools bug
      // when switching tabs; not from app code. Safe to ignore.
    }
  });

  // Log load failures (e.g. file not found) so you can see them when running from terminal
  window.webContents.on('did-fail-load', (_event, code, errDesc, url) => {
    console.error('[ReYoGo] Failed to load:', code, errDesc, url);
  });

  // Block cmd+click / middle-click from spawning new windows
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  // In production: getAppPath() already points at app.asar (or its root); do not add 'app.asar' again
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
  let dbError: string | null = null;
  let pendingSender: Electron.WebContents | null = null;

  const trySendDbReady = () => {
    if (pendingSender && !pendingSender.isDestroyed()) {
      if (dbError !== null) {
        pendingSender.send(DB_INIT_ERROR_CHANNEL, dbError);
      } else if (dbReady) {
        pendingSender.send(getDbReadyChannel());
      } else {
        return;
      }
      pendingSender = null;
    }
  };

  ipcMain.on(DB_REQUEST_READY_CHANNEL, (event) => {
    pendingSender = event.sender;
    trySendDbReady();
  });

  initDatabase()
    .then(() => {
      dbReady = true;
      trySendDbReady();
      if (isReplicaMode()) {
        const interval = setInterval(runBackgroundSync, BACKGROUND_SYNC_INTERVAL_MS);
        app.once('will-quit', () => clearInterval(interval));
        app.on('browser-window-focus', runBackgroundSync);
      }
    })
    .catch((err) => {
      console.error('[ReYoGo] Failed to initialize database:', err);
      dbError = err instanceof Error ? err.message : String(err);
      trySendDbReady();
    });

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

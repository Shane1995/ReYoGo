import { app, BrowserWindow, ipcMain, net } from 'electron';
import { autoUpdater } from 'electron-updater';
import { join } from 'path';
import {
  DB_REQUEST_READY_CHANNEL,
  DB_INIT_ERROR_CHANNEL,
  DB_AUTH_ERROR_CHANNEL,
  DB_SETUP_NEEDED_CHANNEL,
} from '@shared/ipc-events';
import {
  getDbReadyChannel,
  initDatabase,
  isDbInitialized,
  repairUomLinksIfNeeded,
  isReplicaMode,
} from './db';
import { hasCloudCredentials, markOffline } from './db/cloudSync';
import { registerRoute } from './lib/electron-router-dom';
import { registerIPC } from './ipc';

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
  let pendingSender: Electron.WebContents | null = null;

  const onDbReady = () => {
    if (isReplicaMode() && !net.isOnline()) markOffline();
    dbReady = true;
    dbSetupNeeded = false;
    trySendDbReady();
    repairUomLinksIfNeeded().catch((err) => {
      console.error('[ReYoGo] UoM repair failed:', err);
    });
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

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

function initDbState() {
  return {
    dbReady: false,
    dbSetupNeeded: false,
    dbError: null as string | null,
    dbAuthError: null as string | null,
    pendingSender: null as Electron.WebContents | null,
  };
}

function buildTrySendDbReady(state: ReturnType<typeof initDbState>) {
  return () => {
    if (!state.pendingSender || state.pendingSender.isDestroyed()) return;
    const signal: [string, string?] | null =
      state.dbAuthError !== null
        ? [DB_AUTH_ERROR_CHANNEL, state.dbAuthError]
        : state.dbError !== null
          ? [DB_INIT_ERROR_CHANNEL, state.dbError]
          : state.dbReady
            ? [getDbReadyChannel()]
            : state.dbSetupNeeded
              ? [DB_SETUP_NEEDED_CHANNEL]
              : null;
    if (!signal) return;
    state.pendingSender.send(...signal);
    state.pendingSender = null;
  };
}

function setupDbLifecycle() {
  const state = initDbState();
  const trySendDbReady = buildTrySendDbReady(state);

  const onDbReady = () => {
    if (isReplicaMode() && !net.isOnline()) markOffline();
    state.dbReady = true;
    state.dbSetupNeeded = false;
    trySendDbReady();
    repairUomLinksIfNeeded().catch((err) => {
      console.error('[ReYoGo] UoM repair failed:', err);
    });
  };

  ipcMain.on(DB_REQUEST_READY_CHANNEL, (event) => {
    state.pendingSender = event.sender;
    if (!state.dbReady && isDbInitialized()) {
      onDbReady();
      return;
    }
    trySendDbReady();
  });

  if (!hasCloudCredentials()) {
    state.dbSetupNeeded = true;
    trySendDbReady();
  } else {
    initDatabase()
      .then(onDbReady)
      .catch((err) => {
        console.error('[ReYoGo] Failed to initialize database:', err);
        const isAuthError = (err as { isCloudAuthError?: boolean }).isCloudAuthError === true;
        if (isAuthError) {
          state.dbSetupNeeded = true;
        } else {
          state.dbError = err instanceof Error ? err.message : String(err);
        }
        trySendDbReady();
      });
  }
}

app.whenReady().then(() => {
  registerIPC();
  createWindow();

  if (app.isPackaged) {
    autoUpdater.checkForUpdates();
  }

  setupDbLifecycle();

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

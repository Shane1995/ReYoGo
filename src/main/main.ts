import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { DB_REQUEST_READY_CHANNEL } from '../shared/ipc-events';
import { getDbReadyChannel, initDatabase } from './db';
import { registerRoute } from './lib/electron-router-dom';
import { registerIPC } from './ipc';

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  window.once('ready-to-show', () => {
    if (isDev || process.env.ROYOGO_DEBUG === '1') {
      window.webContents.openDevTools();
      // Note: "ReferenceError: dragEvent is not defined" in console is a known Chrome DevTools bug
      // when switching tabs; not from app code. Safe to ignore.
    }
  });

  // Log load failures (e.g. file not found) so you can see them when running from terminal
  window.webContents.on('did-fail-load', (_event, code, errDesc, url) => {
    console.error('[RoYoGo] Failed to load:', code, errDesc, url);
  });

  // In production: getAppPath() already points at app.asar (or its root); do not add 'app.asar' again
  const htmlPath = app.isPackaged
    ? join(app.getAppPath(), 'dist', 'index.html')
    : join(__dirname, '../../dist/index.html');

  registerRoute({
    id: 'main',
    browserWindow: window,
    htmlFile: htmlPath,
  });

  return window;
}

app.whenReady().then(() => {
  registerIPC();
  const mainWindow = createWindow();

  let dbReady = false;
  let rendererWaiting = false;

  const trySendDbReady = () => {
    if (dbReady && rendererWaiting) {
      mainWindow.webContents.send(getDbReadyChannel());
    }
  };

  ipcMain.on(DB_REQUEST_READY_CHANNEL, () => {
    rendererWaiting = true;
    trySendDbReady();
  });

  initDatabase()
    .then(() => {
      dbReady = true;
      setTimeout(() => {
        trySendDbReady();
      }, 10000);
    })
    .catch((err) => {
      console.error('Failed to init database', err);
      dbReady = true;
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

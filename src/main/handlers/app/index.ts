import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import { AppIPC } from '../../../shared/types/ipc';

interface AppVersionInfo {
  version: string;
  env: string;
}

function getVersion(): AppVersionInfo {
  return {
    version: app.getVersion(),
    env: process.env.VITE_APP_ENV ?? 'development',
  };
}

export function registerAppHandlers(): void {
  ipcMain.handle(AppIPC.GET_VERSION, getVersion);
  ipcMain.handle(AppIPC.INSTALL_UPDATE, () => autoUpdater.quitAndInstall());

  autoUpdater.once('update-downloaded', () => {
    BrowserWindow.getAllWindows()[0]?.webContents.send(AppIPC.UPDATE_DOWNLOADED);
  });

  autoUpdater.on('error', (err) => {
    console.error('[updater]', err);
  });
}

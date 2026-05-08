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
  ipcMain.handle(AppIPC.CHECK_FOR_UPDATES, async () => {
    const result = await autoUpdater.checkForUpdates();
    const hasUpdate = result !== null && result.updateInfo.version !== app.getVersion();
    return { hasUpdate };
  });

  autoUpdater.once('update-downloaded', () => {
    BrowserWindow.getAllWindows()[0]?.webContents.send(AppIPC.UPDATE_DOWNLOADED);
  });

  autoUpdater.on('error', (err: Error) => {
    BrowserWindow.getAllWindows()[0]?.webContents.send(AppIPC.UPDATE_ERROR, err.message);
  });
}

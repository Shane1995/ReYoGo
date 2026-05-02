import { app, ipcMain } from 'electron';
import { AppIPC } from '@shared/types/ipc';

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
}

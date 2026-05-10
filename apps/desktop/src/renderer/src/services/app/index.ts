import { AppIPC } from '@shared/types/ipc';
import type { AppVersionInfo } from '@shared/types/ipc/invoke-map';

export type { AppVersionInfo };

export const appService = {
  onAppReady: (callback: () => void) => window.electronAPI.onAppReady(callback),
  requestAppReady: () => window.electronAPI.requestAppReady(),
  getVersion: (): Promise<AppVersionInfo> =>
    window.electronAPI.ipcRenderer.invoke(AppIPC.GET_VERSION),
  onUpdateDownloaded: (callback: () => void): (() => void) =>
    window.electronAPI.onUpdateDownloaded(callback),
  installUpdate: (): Promise<void> => window.electronAPI.ipcRenderer.invoke(AppIPC.INSTALL_UPDATE),
  checkForUpdates: (): Promise<{ hasUpdate: boolean }> =>
    window.electronAPI.ipcRenderer.invoke(AppIPC.CHECK_FOR_UPDATES),
  onUpdateError: (callback: (message: string) => void): (() => void) =>
    window.electronAPI.onUpdateError(callback),
};

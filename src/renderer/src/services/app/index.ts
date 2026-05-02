import { AppIPC } from '@shared/types/ipc';
import type { AppVersionInfo } from '@shared/types/ipc/invoke-map';

export type { AppVersionInfo };

export const appService = {
  onAppReady: (callback: () => void) => window.electronAPI.onAppReady(callback),
  requestAppReady: () => window.electronAPI.requestAppReady(),
  getVersion: (): Promise<AppVersionInfo> =>
    window.electronAPI.ipcRenderer.invoke(AppIPC.GET_VERSION),
};

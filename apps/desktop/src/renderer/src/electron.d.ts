import type { TypedInvoke } from '@shared/types/ipc';
import type { CloudSyncEvent } from '@shared/types/cloudSync';

export interface IPCRenderer {
  invoke: TypedInvoke;
  on(channel: string, listener: (event: unknown, ...args: unknown[]) => void): void;
  removeListener(channel: string, listener: (event: unknown, ...args: unknown[]) => void): void;
}

export interface ElectronAPI {
  platform: string;
  ipcRenderer: IPCRenderer;
  onAppReady: (callback: () => void) => () => void;
  onAppInitError: (callback: (message: string) => void) => () => void;
  onDbAuthError: (callback: (message: string) => void) => () => void;
  requestAppReady: () => void;
  onUpdateDownloaded: (callback: () => void) => () => void;
  onUpdateError: (callback: (message: string) => void) => () => void;
  onCloudSyncEvent: (callback: (event: CloudSyncEvent) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

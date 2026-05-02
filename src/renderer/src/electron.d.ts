import type { TypedInvoke } from '@shared/types/ipc';

export interface ElectronAPI {
  platform: string;
  ipcRenderer: {
    invoke: TypedInvoke;
  };
  onAppReady: (callback: () => void) => void;
  requestAppReady: () => void;
  onUpdateDownloaded: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

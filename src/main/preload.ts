import { contextBridge, ipcRenderer } from 'electron';
import { AppIPC } from '../shared/types/ipc';

const DB_READY_CHANNEL = 'db:ready';
const DB_REQUEST_READY_CHANNEL = 'db:request-ready';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  ipcRenderer: {
    invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
  },
  onAppReady: (callback: () => void) => {
    ipcRenderer.once(DB_READY_CHANNEL, callback);
  },
  requestAppReady: () => {
    ipcRenderer.send(DB_REQUEST_READY_CHANNEL);
  },
  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on(AppIPC.UPDATE_DOWNLOADED, callback);
    return () => ipcRenderer.removeListener(AppIPC.UPDATE_DOWNLOADED, callback);
  },
});

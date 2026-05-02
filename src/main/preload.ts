import { contextBridge, ipcRenderer } from 'electron';

const DB_READY_CHANNEL = 'db:ready';
const DB_REQUEST_READY_CHANNEL = 'db:request-ready';
const UPDATE_DOWNLOADED_CHANNEL = 'app:update-downloaded';

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
    ipcRenderer.on(UPDATE_DOWNLOADED_CHANNEL, callback);
    return () => ipcRenderer.removeListener(UPDATE_DOWNLOADED_CHANNEL, callback);
  },
});

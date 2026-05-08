import { contextBridge, ipcRenderer } from 'electron';

const DB_READY_CHANNEL = 'db:ready';
const DB_REQUEST_READY_CHANNEL = 'db:request-ready';
const UPDATE_DOWNLOADED_CHANNEL = 'app:update-downloaded';
const UPDATE_ERROR_CHANNEL = 'app:update-error';

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
  onUpdateError: (callback: (message: string) => void) => {
    const wrapped = (_: unknown, message: string) => callback(message);
    ipcRenderer.on(UPDATE_ERROR_CHANNEL, wrapped);
    return () => ipcRenderer.removeListener(UPDATE_ERROR_CHANNEL, wrapped);
  },
});

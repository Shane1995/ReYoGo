import { contextBridge, ipcRenderer } from 'electron';

const DB_READY_CHANNEL = 'db:ready';
const DB_INIT_ERROR_CHANNEL = 'db:init-error';
const DB_AUTH_ERROR_CHANNEL = 'db:auth-error';
const DB_REQUEST_READY_CHANNEL = 'db:request-ready';
const UPDATE_DOWNLOADED_CHANNEL = 'app:update-downloaded';
const UPDATE_ERROR_CHANNEL = 'app:update-error';
const CLOUD_SYNC_EVENT_CHANNEL = 'cloud-sync:event';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  ipcRenderer: {
    invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
    on: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => {
      ipcRenderer.on(channel, listener);
    },
    removeListener: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => {
      ipcRenderer.removeListener(channel, listener);
    },
  },
  onAppReady: (callback: () => void) => {
    ipcRenderer.once(DB_READY_CHANNEL, callback);
    return () => ipcRenderer.removeListener(DB_READY_CHANNEL, callback);
  },
  onAppInitError: (callback: (message: string) => void) => {
    const wrapped = (_event: unknown, message: string) => callback(message);
    ipcRenderer.once(DB_INIT_ERROR_CHANNEL, wrapped);
    return () => ipcRenderer.removeListener(DB_INIT_ERROR_CHANNEL, wrapped);
  },
  onDbAuthError: (callback: (message: string) => void) => {
    const wrapped = (_event: unknown, message: string) => callback(message);
    ipcRenderer.once(DB_AUTH_ERROR_CHANNEL, wrapped);
    return () => ipcRenderer.removeListener(DB_AUTH_ERROR_CHANNEL, wrapped);
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
  onCloudSyncEvent: (callback: (event: unknown) => void) => {
    const handler = (_: unknown, event: unknown) => callback(event);
    ipcRenderer.on(CLOUD_SYNC_EVENT_CHANNEL, handler);
    return () => ipcRenderer.removeListener(CLOUD_SYNC_EVENT_CHANNEL, handler);
  },
});

import { contextBridge, ipcRenderer } from 'electron';

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
});

import type { IPCChannel } from '@shared/types/ipc';

export function invokeInventory(channel: IPCChannel, ...args: unknown[]): Promise<unknown> {
  if (typeof window === 'undefined' || !window.electronAPI?.ipcRenderer?.invoke) {
    return Promise.resolve();
  }
  const invoke = window.electronAPI.ipcRenderer.invoke as (
    ch: string,
    ...a: unknown[]
  ) => Promise<unknown>;
  return invoke(channel, ...args);
}

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryIPC } from '@shared/types/ipc';
import { invokeInventory } from '.';

beforeEach(() => {
  Object.defineProperty(window, 'electronAPI', {
    value: undefined,
    writable: true,
    configurable: true,
  });
});

describe('invokeInventory', () => {
  it('resolves to undefined when electronAPI is unavailable', async () => {
    await expect(invokeInventory(InventoryIPC.GET_CATEGORIES)).resolves.toBeUndefined();
  });

  it('delegates to window.electronAPI.ipcRenderer.invoke when available', async () => {
    const invoke = vi.fn().mockResolvedValue([]);
    Object.defineProperty(window, 'electronAPI', {
      value: { ipcRenderer: { invoke } },
      writable: true,
      configurable: true,
    });

    await invokeInventory(InventoryIPC.GET_CATEGORIES);

    expect(invoke).toHaveBeenCalledWith(InventoryIPC.GET_CATEGORIES);
  });
});

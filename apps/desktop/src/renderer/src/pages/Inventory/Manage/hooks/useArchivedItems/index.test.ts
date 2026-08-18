import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { toast } from 'sonner';
import { InventoryIPC, SetupIPC } from '@shared/types/ipc';
import { useArchivedItems } from '.';

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const invoke = vi.fn();

beforeEach(() => {
  Object.defineProperty(window, 'electronAPI', {
    value: { ipcRenderer: { invoke } },
    writable: true,
    configurable: true,
  });

  invoke.mockImplementation((channel: string) => {
    if (channel === InventoryIPC.GET_ARCHIVED_ITEMS) {
      return Promise.resolve([
        { id: 'item-1', name: 'Bleach', categoryId: 'cat-1', unitOfMeasureId: 'unit-1' },
        { id: 'item-2', name: 'Sponges', categoryId: 'cat-2', unitOfMeasureId: undefined },
      ]);
    }
    if (channel === InventoryIPC.GET_CATEGORIES) {
      return Promise.resolve([{ id: 'cat-1', name: 'Cleaning' }]);
    }
    if (channel === SetupIPC.GET_UNITS) {
      return Promise.resolve([{ id: 'unit-1', name: 'Litre' }]);
    }
    if (channel === InventoryIPC.RESTORE_ITEM) {
      return Promise.resolve();
    }
    return Promise.resolve(undefined);
  });
});

describe('useArchivedItems', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() => useArchivedItems());
    expect(result.current.loading).toBe(true);
  });

  it('maps archived items to category names and units, defaulting unresolved categories to —', async () => {
    const { result } = renderHook(() => useArchivedItems());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.itemRows).toEqual([
      { id: 'item-1', name: 'Bleach', categoryName: 'Cleaning', unitOfMeasure: 'Litre' },
      { id: 'item-2', name: 'Sponges', categoryName: '—', unitOfMeasure: undefined },
    ]);
  });

  it('restores an item and reloads the list', async () => {
    const { result } = renderHook(() => useArchivedItems());
    await waitFor(() => expect(result.current.loading).toBe(false));

    invoke.mockClear();
    await act(async () => {
      await result.current.unarchiveItem('item-1');
    });

    expect(invoke).toHaveBeenCalledWith(InventoryIPC.RESTORE_ITEM, 'item-1');
    expect(invoke).toHaveBeenCalledWith(InventoryIPC.GET_ARCHIVED_ITEMS);
  });

  it('shows a success toast when an item is restored', async () => {
    const { result } = renderHook(() => useArchivedItems());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.unarchiveItem('item-1');
    });

    expect(toast.success).toHaveBeenCalled();
  });

  it('shows an error toast when restoring an item fails', async () => {
    const { result } = renderHook(() => useArchivedItems());
    await waitFor(() => expect(result.current.loading).toBe(false));

    invoke.mockImplementation((channel: string) => {
      if (channel === InventoryIPC.RESTORE_ITEM) return Promise.reject(new Error('boom'));
      return Promise.resolve([]);
    });

    await act(async () => {
      await result.current.unarchiveItem('item-1');
    });

    expect(toast.error).toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { InventoryProvider, useInventory } from './index';

const mockInvoke = vi.fn();

beforeEach(() => {
  mockInvoke.mockReset();
  Object.defineProperty(window, 'electronAPI', {
    value: { ipcRenderer: { invoke: mockInvoke } },
    writable: true,
    configurable: true,
  });
});

describe('InventoryContext', () => {
  it('exposes unitOptions derived from setup:get-units response', async () => {
    mockInvoke.mockImplementation((channel: string) => {
      if (channel === 'setup:get-units') {
        return Promise.resolve([
          { id: 'u1', name: 'kg' },
          { id: 'u2', name: 'L' },
        ]);
      }
      return Promise.resolve([]);
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <InventoryProvider>{children}</InventoryProvider>
    );

    const { result } = renderHook(() => useInventory(), { wrapper });

    await waitFor(() => expect(result.current.unitOptions).toHaveLength(2));

    expect(result.current.unitOptions[0]).toEqual({ id: 'u1', name: 'kg' });
    expect(result.current.unitOptions[1]).toEqual({ id: 'u2', name: 'L' });
  });

  it('enriches items with unitOfMeasure name from unitMap', async () => {
    mockInvoke.mockImplementation((channel: string) => {
      if (channel === 'setup:get-units') {
        return Promise.resolve([{ id: 'u1', name: 'kg' }]);
      }
      if (channel === 'inventory:get-items') {
        return Promise.resolve([
          {
            id: 'i1',
            entityId: 'e1',
            name: 'Chicken',
            categoryId: 'c1',
            type: 'Food',
            unitOfMeasureId: 'u1',
          },
        ]);
      }
      return Promise.resolve([]);
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <InventoryProvider>{children}</InventoryProvider>
    );

    const { result } = renderHook(() => useInventory(), { wrapper });

    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.items[0]!.unitOfMeasure).toBe('kg');
  });
});

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountEntries } from '.';
import type { IStocktakeSessionWithLines } from '@reyogo/types';

const session: IStocktakeSessionWithLines = {
  id: 's1',
  accountId: 'default',
  label: 'Week 1',
  status: 'open',
  completedAt: null,
  createdAt: new Date(),
  lines: [{ id: 'l1', sessionId: 's1', inventoryItemId: 'item-1', countedQty: 5, notes: null }],
};

describe('useCountEntries', () => {
  it('seeds counted qty from the session lines', () => {
    const { result } = renderHook(() => useCountEntries(session));
    expect(result.current.countedQtyByItem).toEqual({ 'item-1': 5 });
  });

  it('has no entries when there is no session', () => {
    const { result } = renderHook(() => useCountEntries(null));
    expect(result.current.countedQtyByItem).toEqual({});
    expect(result.current.lines).toEqual([]);
  });

  it('updates an existing line qty, keeping its id', () => {
    const { result } = renderHook(() => useCountEntries(session));
    act(() => result.current.setQty('item-1', 9));
    expect(result.current.countedQtyByItem['item-1']).toBe(9);
    expect(result.current.lines.find((l) => l.inventoryItemId === 'item-1')?.id).toBe('l1');
  });

  it('creates a new entry with a generated id for a previously uncounted item', () => {
    const { result } = renderHook(() => useCountEntries(session));
    act(() => result.current.setQty('item-2', 3));
    const line = result.current.lines.find((l) => l.inventoryItemId === 'item-2');
    expect(line?.countedQty).toBe(3);
    expect(line?.id).toBeTruthy();
  });

  it('removes the entry when qty is set to null', () => {
    const { result } = renderHook(() => useCountEntries(session));
    act(() => result.current.setQty('item-1', null));
    expect(result.current.countedQtyByItem['item-1']).toBeUndefined();
  });
});

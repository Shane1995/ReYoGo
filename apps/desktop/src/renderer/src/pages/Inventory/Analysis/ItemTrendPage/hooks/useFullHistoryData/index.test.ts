import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const getMovementsForItemWithLabels = vi.fn();

vi.mock('@/services/stockMovements', () => ({
  stockMovementsService: {
    getMovementsForItemWithLabels: (...args: unknown[]) => getMovementsForItemWithLabels(...args),
  },
}));

import { useFullHistoryData } from '.';

beforeEach(() => {
  getMovementsForItemWithLabels.mockReset();
  getMovementsForItemWithLabels.mockResolvedValue([]);
});

describe('useFullHistoryData', () => {
  it('does not fetch when itemId is undefined', () => {
    renderHook(() => useFullHistoryData(undefined));
    expect(getMovementsForItemWithLabels).not.toHaveBeenCalled();
  });

  it('fetches movements for the given item', async () => {
    const { result } = renderHook(() => useFullHistoryData('item-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getMovementsForItemWithLabels).toHaveBeenCalledWith('item-1');
  });

  it('exposes the fetched movements', async () => {
    getMovementsForItemWithLabels.mockResolvedValue([
      { id: 'm1', movementType: 'IN', qty: 5, referenceLabel: 'INV-001' },
    ]);
    const { result } = renderHook(() => useFullHistoryData('item-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.movements).toHaveLength(1);
  });

  it('starts in a loading state once itemId is provided', () => {
    const { result } = renderHook(() => useFullHistoryData('item-1'));
    expect(result.current.loading).toBe(true);
  });
});

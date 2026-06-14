import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { InvoiceLineWithDate, ItemCostHistory } from '@reyogo/types';
import { useItemTrendData } from '.';

const getItemCostHistory = vi.fn();
const useAnalysisLines = vi.fn();
const useInventory = vi.fn();

vi.mock('@/services/stockMovements', () => ({
  stockMovementsService: {
    getItemCostHistory: (...args: unknown[]) => getItemCostHistory(...args),
  },
}));

vi.mock('@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext', () => ({
  useInventory: () => useInventory(),
}));

vi.mock('../../../hooks/useAnalysisLines', () => ({
  useAnalysisLines: () => useAnalysisLines(),
}));

const baseLine: InvoiceLineWithDate = {
  id: 'line-1',
  invoiceId: 'inv-1',
  inventoryItemId: 'item-1',
  qty: 2,
  unitCost: 10,
  totalCost: 20,
  invoiceDate: new Date('2026-01-01'),
  categoryType: 'food',
  categoryName: 'Pantry',
  vatRate: 0,
  isVatable: false,
  unitCostInclVat: 10,
};

const lines: InvoiceLineWithDate[] = [
  baseLine,
  {
    ...baseLine,
    id: 'line-2',
    invoiceId: 'inv-2',
    qty: 3,
    unitCost: 12,
    totalCost: 36,
    invoiceDate: new Date('2026-02-01'),
    unitCostInclVat: 12,
  },
];

const items = [{ id: 'item-1', name: 'Olive Oil', unitOfMeasure: 'L' }];

const baseCostHistory: ItemCostHistory = {
  itemId: 'item-1',
  weightedAvgCost: 11,
  totalStock: 5,
  movements: [],
};

beforeEach(() => {
  getItemCostHistory.mockReset();
  useAnalysisLines.mockReset();
  useInventory.mockReset();

  getItemCostHistory.mockResolvedValue(baseCostHistory);
  useAnalysisLines.mockReturnValue({ lines, loading: false });
  useInventory.mockReturnValue({ items });
});

describe('useItemTrendData', () => {
  it('starts in loading state when lines are loading', () => {
    useAnalysisLines.mockReturnValue({ lines: [], loading: true });
    const { result } = renderHook(() => useItemTrendData('item-1'));
    expect(result.current.loading).toBe(true);
  });

  it('returns null group when itemId has no matching entries', async () => {
    const { result } = renderHook(() => useItemTrendData('item-missing'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.group).toBeNull();
    expect(result.current.chartData).toEqual([]);
    expect(result.current.stats).toBeNull();
  });

  it('builds group, chartData, and stats for a matching item', async () => {
    const { result } = renderHook(() => useItemTrendData('item-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.group?.itemId).toBe('item-1');
    expect(result.current.group?.name).toBe('Olive Oil');
    expect(result.current.group?.entries).toHaveLength(2);

    expect(result.current.chartData).toHaveLength(2);
    expect(result.current.chartData[0]).toMatchObject({ price: 10, qty: 2 });
    expect(result.current.chartData[1]).toMatchObject({ price: 12, qty: 3 });

    expect(result.current.stats).toMatchObject({
      min: 10,
      max: 12,
      avg: 11,
      first: 10,
      last: 12,
      count: 2,
      uom: 'L',
    });
  });

  it('fetches and exposes cost history for the given itemId', async () => {
    const { result } = renderHook(() => useItemTrendData('item-1'));
    await waitFor(() => expect(result.current.costHistory).toEqual(baseCostHistory));
    expect(getItemCostHistory).toHaveBeenCalledWith('item-1');
  });
});

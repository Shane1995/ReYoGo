import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { InvoiceLineWithDate } from '@reyogo/types';
import { useItemCostHistoryData } from '.';

const useAnalysisLines = vi.fn();
const useInventory = vi.fn();

vi.mock('@/pages/Inventory/Analysis/hooks/useAnalysisLines', () => ({
  useAnalysisLines: (entityId?: string) => useAnalysisLines(entityId),
}));

vi.mock('@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext', () => ({
  useInventory: () => useInventory(),
}));

const lines: InvoiceLineWithDate[] = [
  {
    id: 'l1',
    invoiceId: 'inv-1',
    inventoryItemId: 'item-1',
    qty: 2,
    unitCost: 10,
    totalCost: 20,
    invoiceDate: new Date('2026-01-01'),
    categoryType: 'food',
    categoryName: 'Dairy',
    vatRate: 15,
    isVatable: true,
    unitCostInclVat: 11.5,
  },
  {
    id: 'l2',
    invoiceId: 'inv-2',
    inventoryItemId: 'item-2',
    qty: 1,
    unitCost: 5,
    totalCost: 5,
    invoiceDate: new Date('2026-01-02'),
    categoryType: 'beverage',
    categoryName: 'Beverages',
    vatRate: 15,
    isVatable: true,
    unitCostInclVat: 5.75,
  },
];

const items = [
  { id: 'item-1', name: 'Milk', unitOfMeasure: 'L' },
  { id: 'item-2', name: 'Cola', unitOfMeasure: 'L' },
];

beforeEach(() => {
  useAnalysisLines.mockReset();
  useInventory.mockReset();
  useAnalysisLines.mockReturnValue({ lines, loading: false });
  useInventory.mockReturnValue({ items });
});

describe('useItemCostHistoryData', () => {
  it('passes entityId through to useAnalysisLines', () => {
    renderHook(() => useItemCostHistoryData('', '', 'entity-1'));
    expect(useAnalysisLines).toHaveBeenCalledWith('entity-1');
  });

  it('groups lines by item within the date range', async () => {
    const { result } = renderHook(() => useItemCostHistoryData('', '', undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.groups).toHaveLength(2);
  });

  it('exposes available categories from the grouped data', async () => {
    const { result } = renderHook(() => useItemCostHistoryData('', '', undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.availableCategories).toEqual(['Beverages', 'Dairy']);
  });

  it('filters groups down to the selected categories', async () => {
    const { result } = renderHook(() => useItemCostHistoryData('', '', undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setSelectedCategories(['Beverages']));
    expect(result.current.groups).toHaveLength(1);
    expect(result.current.groups[0]!.itemId).toBe('item-2');
  });

  it('reflects useAnalysisLines loading state', () => {
    useAnalysisLines.mockReturnValue({ lines: [], loading: true });
    const { result } = renderHook(() => useItemCostHistoryData('', '', undefined));
    expect(result.current.loading).toBe(true);
  });
});

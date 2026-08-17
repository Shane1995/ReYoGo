import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const useInventory = vi.fn();
const getCreditTotalsByItem = vi.fn();

vi.mock('@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext', () => ({
  useInventory: () => useInventory(),
}));

vi.mock('@/services/invoice', () => ({
  invoiceService: {
    getCreditTotalsByItem: (...args: unknown[]) => getCreditTotalsByItem(...args),
  },
}));

import { useCreditReportData } from '.';

const items = [
  { id: 'item-1', name: 'Milk', categoryId: 'cat-1', type: 'food', unitOfMeasure: 'L' },
];
const categories = [{ id: 'cat-1', name: 'Dairy', type: 'food' }];

beforeEach(() => {
  useInventory.mockReset();
  getCreditTotalsByItem.mockReset();
  useInventory.mockReturnValue({ items, categories });
  getCreditTotalsByItem.mockResolvedValue({ 'item-1': { qty: 2, totalValue: 8 } });
});

describe('useCreditReportData', () => {
  it('passes date range and entityId through to the service', () => {
    renderHook(() => useCreditReportData('2026-01-01', '2026-01-31', 'entity-1'));
    expect(getCreditTotalsByItem).toHaveBeenCalledWith('2026-01-01', '2026-01-31', 'entity-1');
  });

  it('converts empty date strings to undefined', () => {
    renderHook(() => useCreditReportData('', '', undefined));
    expect(getCreditTotalsByItem).toHaveBeenCalledWith(undefined, undefined, undefined);
  });

  it('builds rows joined with item/category data', async () => {
    const { result } = renderHook(() => useCreditReportData('', '', undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rows).toEqual([
      {
        itemId: 'item-1',
        itemName: 'Milk',
        categoryName: 'Dairy',
        categoryType: 'food',
        uom: 'L',
        qty: 2,
        totalValue: 8,
      },
    ]);
  });
});

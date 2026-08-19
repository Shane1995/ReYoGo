import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const useInventory = vi.fn();
const getPurchaseTotalsByItem = vi.fn();

vi.mock('@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext', () => ({
  useInventory: () => useInventory(),
}));

vi.mock('@/services/invoice', () => ({
  invoiceService: {
    getPurchaseTotalsByItem: (...args: unknown[]) => getPurchaseTotalsByItem(...args),
  },
}));

import { usePurchaseReportData } from '.';

const items = [
  { id: 'item-1', name: 'Milk', categoryId: 'cat-1', type: 'food', unitOfMeasure: 'L' },
];
const categories = [{ id: 'cat-1', name: 'Dairy', type: 'food' }];

beforeEach(() => {
  useInventory.mockReset();
  getPurchaseTotalsByItem.mockReset();
  useInventory.mockReturnValue({ items, categories });
  getPurchaseTotalsByItem.mockResolvedValue({ 'item-1': { qty: 10, totalValue: 40 } });
});

describe('usePurchaseReportData', () => {
  it('passes date range and entityId through to the service', () => {
    renderHook(() => usePurchaseReportData('2026-01-01', '2026-01-31', 'entity-1'));
    expect(getPurchaseTotalsByItem).toHaveBeenCalledWith('2026-01-01', '2026-01-31', 'entity-1');
  });

  it('converts empty date strings to undefined', () => {
    renderHook(() => usePurchaseReportData('', '', undefined));
    expect(getPurchaseTotalsByItem).toHaveBeenCalledWith(undefined, undefined, undefined);
  });

  it('builds rows joined with item/category data', async () => {
    const { result } = renderHook(() => usePurchaseReportData('', '', undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rows).toEqual([
      {
        itemId: 'item-1',
        itemName: 'Milk',
        categoryName: 'Dairy',
        categoryType: 'food',
        uom: 'L',
        qty: 10,
        totalValue: 40,
      },
    ]);
  });
});

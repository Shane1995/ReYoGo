import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStockLevelRows } from '.';

const useInventory = vi.fn();
const getCurrentStock = vi.fn();
const getWeightedAvgCosts = vi.fn();

vi.mock('@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext', () => ({
  useInventory: () => useInventory(),
}));

vi.mock('@/services/stockMovements', () => ({
  stockMovementsService: {
    getCurrentStock: (entityId?: string, asOfDate?: string) => getCurrentStock(entityId, asOfDate),
    getWeightedAvgCosts: (entityId?: string, asOfDate?: string) =>
      getWeightedAvgCosts(entityId, asOfDate),
  },
}));

const items = [
  { id: 'item-1', name: 'Milk', categoryId: 'cat-1', type: 'food', unitOfMeasure: 'L' },
  { id: 'item-2', name: 'Cola', categoryId: 'cat-2', type: 'beverage', unitOfMeasure: 'L' },
];
const categories = [
  { id: 'cat-1', name: 'Dairy', type: 'food' },
  { id: 'cat-2', name: 'Beverages', type: 'beverage' },
];

beforeEach(() => {
  useInventory.mockReset();
  getCurrentStock.mockReset();
  getWeightedAvgCosts.mockReset();
  useInventory.mockReturnValue({ items, categories });
  getCurrentStock.mockResolvedValue({ 'item-1': 10, 'item-2': 5 });
  getWeightedAvgCosts.mockResolvedValue({ 'item-1': 2, 'item-2': 3 });
});

describe('useStockLevelRows', () => {
  it('passes entityId and asOfDate through to both stock movement calls', () => {
    renderHook(() => useStockLevelRows('entity-1', '2026-01-15'));
    expect(getCurrentStock).toHaveBeenCalledWith('entity-1', '2026-01-15');
    expect(getWeightedAvgCosts).toHaveBeenCalledWith('entity-1', '2026-01-15');
  });

  it('builds rows from inventory items and stock data once loaded', async () => {
    const { result } = renderHook(() => useStockLevelRows(undefined, undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rows).toHaveLength(2);
  });

  it('exposes available categories from the loaded rows', async () => {
    const { result } = renderHook(() => useStockLevelRows(undefined, undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.availableCategories).toEqual(['Beverages', 'Dairy']);
  });

  it('filters rows down to the selected categories', async () => {
    const { result } = renderHook(() => useStockLevelRows(undefined, undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setSelectedCategories(['Dairy']));
    expect(result.current.rows.map((r) => r.itemId)).toEqual(['item-1']);
  });

  it('starts in a loading state', () => {
    const { result } = renderHook(() => useStockLevelRows(undefined, undefined));
    expect(result.current.loading).toBe(true);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useStockLevelRows } from '.';

const useInventory = vi.fn();
const getCurrentStock = vi.fn();
const getWeightedAvgCosts = vi.fn();

vi.mock('@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext', () => ({
  useInventory: () => useInventory(),
}));

vi.mock('@/services/stockMovements', () => ({
  stockMovementsService: {
    getCurrentStock: (entityId?: string) => getCurrentStock(entityId),
    getWeightedAvgCosts: (entityId?: string) => getWeightedAvgCosts(entityId),
  },
}));

const items = [
  { id: 'item-1', name: 'Milk', categoryId: 'cat-1', type: 'food', unitOfMeasure: 'L' },
];
const categories = [{ id: 'cat-1', name: 'Dairy', type: 'food' }];

beforeEach(() => {
  useInventory.mockReset();
  getCurrentStock.mockReset();
  getWeightedAvgCosts.mockReset();
  useInventory.mockReturnValue({ items, categories });
  getCurrentStock.mockResolvedValue({ 'item-1': 10 });
  getWeightedAvgCosts.mockResolvedValue({ 'item-1': 2 });
});

describe('useStockLevelRows', () => {
  it('passes entityId through to both stock movement calls', () => {
    renderHook(() => useStockLevelRows('entity-1'));
    expect(getCurrentStock).toHaveBeenCalledWith('entity-1');
    expect(getWeightedAvgCosts).toHaveBeenCalledWith('entity-1');
  });

  it('builds rows from inventory items and stock data once loaded', async () => {
    const { result } = renderHook(() => useStockLevelRows(undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rows).toEqual([
      {
        itemId: 'item-1',
        itemName: 'Milk',
        uom: 'L',
        categoryName: 'Dairy',
        categoryType: 'food',
        quantity: 10,
        avgCost: 2,
        totalValue: 20,
      },
    ]);
  });

  it('starts in a loading state', () => {
    const { result } = renderHook(() => useStockLevelRows(undefined));
    expect(result.current.loading).toBe(true);
  });
});

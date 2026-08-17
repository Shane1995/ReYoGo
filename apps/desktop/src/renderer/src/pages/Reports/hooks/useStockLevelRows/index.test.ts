import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useStockLevelRows } from '.';
import { StockCostSource } from './types';

const useInventory = vi.fn();
const getCurrentStock = vi.fn();
const getWeightedAvgCosts = vi.fn();
const getLastUnitPrices = vi.fn();

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

vi.mock('@/services/invoice', () => ({
  invoiceService: {
    getLastUnitPrices: (asOfDate?: string) => getLastUnitPrices(asOfDate),
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
  getLastUnitPrices.mockReset();
  useInventory.mockReturnValue({ items, categories });
  getCurrentStock.mockResolvedValue({ 'item-1': 10, 'item-2': 5 });
  getWeightedAvgCosts.mockResolvedValue({ 'item-1': 2, 'item-2': 3 });
  getLastUnitPrices.mockResolvedValue({
    'item-1': { exclVat: 4, inclVat: 4.6 },
    'item-2': { exclVat: 6, inclVat: 6.9 },
  });
});

describe('useStockLevelRows', () => {
  it('passes entityId and asOfDate through to the WAC calls when costSource is weighted average', () => {
    renderHook(() =>
      useStockLevelRows('entity-1', '2026-01-15', [], '', StockCostSource.WeightedAverage),
    );
    expect(getCurrentStock).toHaveBeenCalledWith('entity-1', '2026-01-15');
    expect(getWeightedAvgCosts).toHaveBeenCalledWith('entity-1', '2026-01-15');
    expect(getLastUnitPrices).not.toHaveBeenCalled();
  });

  it('uses last unit prices instead of WAC when costSource is last cost', async () => {
    const { result } = renderHook(() =>
      useStockLevelRows('entity-1', '2026-01-15', [], '', StockCostSource.LastCost),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getLastUnitPrices).toHaveBeenCalledWith('2026-01-15');
    expect(getWeightedAvgCosts).not.toHaveBeenCalled();
    const milk = result.current.rows.find((r) => r.itemId === 'item-1')!;
    expect(milk.avgCost).toBe(4);
  });

  it('builds rows from inventory items and stock data once loaded', async () => {
    const { result } = renderHook(() =>
      useStockLevelRows(undefined, undefined, [], '', StockCostSource.WeightedAverage),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rows).toHaveLength(2);
  });

  it('exposes available categories from the loaded rows', async () => {
    const { result } = renderHook(() =>
      useStockLevelRows(undefined, undefined, [], '', StockCostSource.WeightedAverage),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.availableCategories).toEqual(['Beverages', 'Dairy']);
  });

  it('exposes available types from the loaded rows', async () => {
    const { result } = renderHook(() =>
      useStockLevelRows(undefined, undefined, [], '', StockCostSource.WeightedAverage),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.availableTypes).toEqual(['food', 'beverage']);
  });

  it('filters rows down to the selected categories', async () => {
    const { result } = renderHook(() =>
      useStockLevelRows(undefined, undefined, ['Dairy'], '', StockCostSource.WeightedAverage),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rows.map((r) => r.itemId)).toEqual(['item-1']);
  });

  it('filters rows down to the selected type', async () => {
    const { result } = renderHook(() =>
      useStockLevelRows(undefined, undefined, [], 'beverage', StockCostSource.WeightedAverage),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rows.map((r) => r.itemId)).toEqual(['item-2']);
  });

  it('starts in a loading state', () => {
    const { result } = renderHook(() =>
      useStockLevelRows(undefined, undefined, [], '', StockCostSource.WeightedAverage),
    );
    expect(result.current.loading).toBe(true);
  });
});

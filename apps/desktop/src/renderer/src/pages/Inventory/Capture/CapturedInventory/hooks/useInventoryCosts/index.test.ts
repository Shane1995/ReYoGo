import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useInventoryCosts } from '.';

vi.mock('@/services/invoice', () => ({
  invoiceService: {
    getLinesForAnalysis: vi.fn(),
  },
}));

vi.mock('@/services/stockMovements', () => ({
  stockMovementsService: {
    getWeightedAvgCosts: vi.fn(),
  },
}));

import { invoiceService } from '@/services/invoice';
import { stockMovementsService } from '@/services/stockMovements';

beforeEach(() => {
  vi.mocked(invoiceService.getLinesForAnalysis).mockResolvedValue([]);
  vi.mocked(stockMovementsService.getWeightedAvgCosts).mockResolvedValue({});
});

describe('useInventoryCosts', () => {
  it('returns empty map when both services return empty', async () => {
    const { result } = renderHook(() => useInventoryCosts());
    await waitFor(() => expect(result.current.size).toBe(0));
  });

  it('merges lastUnitCost from invoice lines using inventoryItemId, qty and unitCost', async () => {
    vi.mocked(invoiceService.getLinesForAnalysis).mockResolvedValue([
      {
        id: 'l1',
        invoiceId: 'inv1',
        inventoryItemId: 'item-1',
        qty: 2,
        unitCost: 10,
        totalCost: 20,
        invoiceDate: new Date('2025-01-01'),
        categoryType: null,
        categoryName: null,
        vatRate: 15,
        isVatable: true,
      },
    ]);
    const { result } = renderHook(() => useInventoryCosts());
    await waitFor(() => expect(result.current.size).toBe(1));
    const entry = result.current.get('item-1');
    expect(entry?.lastUnitCost).toBe(10);
    expect(entry?.lastCostDate).toEqual(new Date('2025-01-01'));
  });

  it('uses the later invoice date as the last cost, not the capture order', async () => {
    vi.mocked(invoiceService.getLinesForAnalysis).mockResolvedValue([
      {
        id: 'l1',
        invoiceId: 'inv1',
        inventoryItemId: 'item-1',
        qty: 1,
        unitCost: 9.28,
        totalCost: 9.28,
        invoiceDate: new Date('2025-05-13'),
        categoryType: null,
        categoryName: null,
        vatRate: 15,
        isVatable: true,
      },
      {
        id: 'l2',
        invoiceId: 'inv2',
        inventoryItemId: 'item-1',
        qty: 1,
        unitCost: 5.88,
        totalCost: 5.88,
        invoiceDate: new Date('2025-05-14'),
        categoryType: null,
        categoryName: null,
        vatRate: 15,
        isVatable: true,
      },
    ]);
    const { result } = renderHook(() => useInventoryCosts());
    await waitFor(() => expect(result.current.size).toBe(1));
    const entry = result.current.get('item-1');
    expect(entry?.lastUnitCost).toBe(5.88);
    expect(entry?.lastCostDate).toEqual(new Date('2025-05-14'));
  });

  it('includes weightedAvgCost from wacRecord for items with no invoice lines', async () => {
    vi.mocked(stockMovementsService.getWeightedAvgCosts).mockResolvedValue({ 'item-2': 7.5 });
    const { result } = renderHook(() => useInventoryCosts());
    await waitFor(() => expect(result.current.size).toBe(1));
    expect(result.current.get('item-2')).toEqual({
      lastUnitCost: null,
      lastCostDate: null,
      weightedAvgCost: 7.5,
    });
  });

  it('skips lines with qty <= 0', async () => {
    vi.mocked(invoiceService.getLinesForAnalysis).mockResolvedValue([
      {
        id: 'l1',
        invoiceId: 'inv1',
        inventoryItemId: 'item-1',
        qty: 0,
        unitCost: 10,
        totalCost: 0,
        invoiceDate: new Date('2025-01-01'),
        categoryType: null,
        categoryName: null,
        vatRate: 15,
        isVatable: true,
      },
    ]);
    const { result } = renderHook(() => useInventoryCosts());
    await waitFor(() => {
      expect(result.current.size).toBe(0);
    });
  });
});

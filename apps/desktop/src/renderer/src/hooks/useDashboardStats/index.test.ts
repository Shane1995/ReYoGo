import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardStats } from '.';

vi.mock('@/services/stockMovements', () => ({
  stockMovementsService: {
    getCurrentStock: vi.fn(),
    getWeightedAvgCosts: vi.fn(),
    getCOGS: vi.fn(),
  },
}));

vi.mock('@/utils/dateRange', () => ({
  currentMonthRange: vi.fn(() => ({ from: '2025-01-01', to: '2025-01-31' })),
}));

import { stockMovementsService } from '@/services/stockMovements';

beforeEach(() => {
  vi.mocked(stockMovementsService.getCurrentStock).mockResolvedValue({ 'item-1': 10, 'item-2': 5 });
  vi.mocked(stockMovementsService.getWeightedAvgCosts).mockResolvedValue({
    'item-1': 20,
    'item-2': 10,
  });
  vi.mocked(stockMovementsService.getCOGS).mockResolvedValue({
    total: 1500,
    byCategory: [],
  });
});

describe('useDashboardStats', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() => useDashboardStats());
    expect(result.current.loading).toBe(true);
  });

  it('calculates total stock value as sum of qty * wac per item', async () => {
    const { result } = renderHook(() => useDashboardStats());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats?.totalStockValue).toBe(250);
  });

  it('returns monthly spend from COGS total', async () => {
    const { result } = renderHook(() => useDashboardStats());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats?.monthlySpend).toBe(1500);
  });

  it('treats null wac as zero when computing stock value', async () => {
    vi.mocked(stockMovementsService.getWeightedAvgCosts).mockResolvedValue({ 'item-1': null });
    vi.mocked(stockMovementsService.getCurrentStock).mockResolvedValue({ 'item-1': 10 });
    const { result } = renderHook(() => useDashboardStats());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats?.totalStockValue).toBe(0);
  });

  it('sets stats to zero on fetch failure', async () => {
    vi.mocked(stockMovementsService.getCurrentStock).mockRejectedValue(new Error('IPC error'));
    const { result } = renderHook(() => useDashboardStats());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats).toEqual({ totalStockValue: 0, monthlySpend: 0 });
  });

  it('exposes a refetch function', () => {
    const { result } = renderHook(() => useDashboardStats());
    expect(typeof result.current.refetch).toBe('function');
  });
});

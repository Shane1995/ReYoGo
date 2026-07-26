import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { COGSSummary } from '@reyogo/types';
import { usePeriodSummaryData } from '.';

const getCOGS = vi.fn();

vi.mock('@/services/stockMovements', () => ({
  stockMovementsService: {
    getCOGS: (...args: unknown[]) => getCOGS(...args),
  },
}));

const cogs: COGSSummary = {
  total: 100,
  byCategory: [{ categoryId: 'c1', categoryName: 'Dairy', total: 100 }],
};

beforeEach(() => {
  getCOGS.mockReset();
  getCOGS.mockResolvedValue(cogs);
});

describe('usePeriodSummaryData', () => {
  it('fetches COGS scoped to the given date range and entity', async () => {
    const { result } = renderHook(() =>
      usePeriodSummaryData('2026-01-01', '2026-01-31', 'entity-1'),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getCOGS).toHaveBeenCalledWith('2026-01-01', '2026-01-31', 'entity-1');
    expect(result.current.cogs).toEqual(cogs);
  });

  it('starts in a loading state', () => {
    const { result } = renderHook(() => usePeriodSummaryData('', '', undefined));
    expect(result.current.loading).toBe(true);
  });

  it('refetches when the date range changes', async () => {
    const { result, rerender } = renderHook(
      ({ from }: { from: string }) => usePeriodSummaryData(from, '', undefined),
      { initialProps: { from: '2026-01-01' } },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    rerender({ from: '2026-02-01' });
    await waitFor(() =>
      expect(getCOGS).toHaveBeenLastCalledWith('2026-02-01', undefined, undefined),
    );
  });

  it('sets cogs to null if the fetch fails', async () => {
    getCOGS.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => usePeriodSummaryData('', '', undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.cogs).toBeNull();
  });
});

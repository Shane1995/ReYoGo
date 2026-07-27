import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAnalysisLines } from '.';

const getLinesForAnalysis = vi.fn();

vi.mock('@/services/invoice', () => ({
  invoiceService: {
    getLinesForAnalysis: (...args: unknown[]) => getLinesForAnalysis(...args),
  },
}));

beforeEach(() => {
  getLinesForAnalysis.mockReset();
  getLinesForAnalysis.mockResolvedValue([]);
});

describe('useAnalysisLines', () => {
  it('fetches with no entityId when none is provided', async () => {
    const { result } = renderHook(() => useAnalysisLines());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getLinesForAnalysis).toHaveBeenCalledWith(undefined);
  });

  it('fetches scoped to the given entityId', async () => {
    const { result } = renderHook(() => useAnalysisLines('entity-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getLinesForAnalysis).toHaveBeenCalledWith('entity-1');
  });

  it('refetches when entityId changes', async () => {
    const { result, rerender } = renderHook(({ entityId }) => useAnalysisLines(entityId), {
      initialProps: { entityId: 'entity-1' as string | undefined },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    rerender({ entityId: 'entity-2' });
    await waitFor(() => expect(getLinesForAnalysis).toHaveBeenLastCalledWith('entity-2'));
  });
});

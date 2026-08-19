import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAnalysisLines } from '.';

const getLinesForAnalysis = vi.fn();
const getCreditedQtyByInvoiceItem = vi.fn();

vi.mock('@/services/invoice', () => ({
  invoiceService: {
    getLinesForAnalysis: (...args: unknown[]) => getLinesForAnalysis(...args),
    getCreditedQtyByInvoiceItem: (...args: unknown[]) => getCreditedQtyByInvoiceItem(...args),
  },
}));

beforeEach(() => {
  getLinesForAnalysis.mockReset();
  getCreditedQtyByInvoiceItem.mockReset();
  getLinesForAnalysis.mockResolvedValue([]);
  getCreditedQtyByInvoiceItem.mockResolvedValue({});
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

  it('excludes lines that have been fully credited', async () => {
    getLinesForAnalysis.mockResolvedValue([
      {
        id: 'l1',
        invoiceId: 'inv-1',
        inventoryItemId: 'item-1',
        qty: 10,
        unitCost: 5,
        totalCost: 50,
      },
      {
        id: 'l2',
        invoiceId: 'inv-2',
        inventoryItemId: 'item-1',
        qty: 4,
        unitCost: 5,
        totalCost: 20,
      },
    ]);
    getCreditedQtyByInvoiceItem.mockResolvedValue({ 'inv-1::item-1': 10 });

    const { result } = renderHook(() => useAnalysisLines());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.lines.map((l) => l.id)).toEqual(['l2']);
  });

  it('keeps lines that have only been partially credited', async () => {
    getLinesForAnalysis.mockResolvedValue([
      {
        id: 'l1',
        invoiceId: 'inv-1',
        inventoryItemId: 'item-1',
        qty: 10,
        unitCost: 5,
        totalCost: 50,
      },
    ]);
    getCreditedQtyByInvoiceItem.mockResolvedValue({ 'inv-1::item-1': 4 });

    const { result } = renderHook(() => useAnalysisLines());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.lines.map((l) => l.id)).toEqual(['l1']);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { toast } from 'sonner';

const postInvoice = vi.fn();
const saveCreditNote = vi.fn();

vi.mock('@/services/invoice', () => ({
  invoiceService: {
    postInvoice: (...args: unknown[]) => postInvoice(...args),
    saveCreditNote: (...args: unknown[]) => saveCreditNote(...args),
  },
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { useInvoicePostHandlers } from '.';

function setup() {
  const setMode = vi.fn();
  const loadInvoices = vi.fn().mockResolvedValue(undefined);
  const setDetailCache = vi.fn();
  const { result } = renderHook(() =>
    useInvoicePostHandlers({ detailCache: {}, setDetailCache, loadInvoices, setMode }),
  );
  return { result };
}

beforeEach(() => {
  vi.clearAllMocks();
  postInvoice.mockResolvedValue(undefined);
  saveCreditNote.mockResolvedValue(undefined);
});

describe('useInvoicePostHandlers', () => {
  it('shows a success toast when an invoice is posted', async () => {
    const { result } = setup();
    await act(() => result.current.handlePost('inv-1'));
    expect(toast.success).toHaveBeenCalled();
  });

  it('shows an error toast when posting fails', async () => {
    postInvoice.mockRejectedValue(new Error('boom'));
    const { result } = setup();
    await act(() => result.current.handlePost('inv-1'));
    expect(toast.error).toHaveBeenCalled();
  });

  it('shows a success toast when a credit note is saved', async () => {
    const { result } = setup();
    await act(() =>
      result.current.handleSaveCreditNote({
        sourceInvoiceId: 'inv-1',
        lines: [],
      } as unknown as Parameters<typeof result.current.handleSaveCreditNote>[0]),
    );
    expect(toast.success).toHaveBeenCalled();
  });

  it('shows an error toast when saving a credit note fails', async () => {
    saveCreditNote.mockRejectedValue(new Error('boom'));
    const { result } = setup();
    await act(() =>
      result.current.handleSaveCreditNote({
        sourceInvoiceId: 'inv-1',
        lines: [],
      } as unknown as Parameters<typeof result.current.handleSaveCreditNote>[0]),
    );
    expect(toast.error).toHaveBeenCalled();
  });
});

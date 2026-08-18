import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { toast } from 'sonner';
import { InvoiceStatus, VatMode } from '@reyogo/types';
import type { ICapturedInvoice } from '@reyogo/types';

const updateInvoice = vi.fn();
const updatePostedInvoiceLines = vi.fn();
const updateInvoiceMetadata = vi.fn();

vi.mock('@/services/invoice', () => ({
  invoiceService: {
    updateInvoice: (...args: unknown[]) => updateInvoice(...args),
    updatePostedInvoiceLines: (...args: unknown[]) => updatePostedInvoiceLines(...args),
    updateInvoiceMetadata: (...args: unknown[]) => updateInvoiceMetadata(...args),
  },
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { useInvoiceSaveHandlers } from '.';

const draftInvoice: ICapturedInvoice = {
  id: 'inv-draft',
  entityId: 'default',
  supplierId: null,
  sourceInvoiceId: null,
  invoiceNumber: 'INV-D',
  invoiceDate: null,
  status: InvoiceStatus.Draft,
  vatMode: VatMode.Exclusive,
  vatRate: 15,
  createdAt: new Date(),
  updatedAt: null,
};

const postedInvoice: ICapturedInvoice = {
  ...draftInvoice,
  id: 'inv-posted',
  status: InvoiceStatus.Posted,
};

const editLines = [
  {
    id: 'l1',
    itemId: 'item-1',
    quantity: '5',
    isVatable: true,
    totalVatExclude: 50,
    unitPrice: 10,
  },
] as unknown as Parameters<ReturnType<typeof useInvoiceSaveHandlers>['handleSaveEdit']>[1];

function setup() {
  const setMode = vi.fn();
  const loadInvoices = vi.fn().mockResolvedValue(undefined);
  const setDetailCache = vi.fn();
  const { result } = renderHook(() =>
    useInvoiceSaveHandlers({
      items: [],
      detailCache: {},
      setDetailCache,
      loadInvoices,
      setMode,
    }),
  );
  return { result, setMode, loadInvoices };
}

beforeEach(() => {
  updateInvoice.mockReset();
  updatePostedInvoiceLines.mockReset();
  updateInvoiceMetadata.mockReset();
  vi.mocked(toast.success).mockReset();
  vi.mocked(toast.error).mockReset();
  updateInvoice.mockResolvedValue(undefined);
  updatePostedInvoiceLines.mockResolvedValue(undefined);
  updateInvoiceMetadata.mockResolvedValue(undefined);
});

describe('useInvoiceSaveHandlers', () => {
  it('calls updateInvoice for a draft invoice', async () => {
    const { result } = setup();
    await act(() => result.current.handleSaveEdit(draftInvoice, editLines, 'note'));
    expect(updateInvoice).toHaveBeenCalled();
    expect(updatePostedInvoiceLines).not.toHaveBeenCalled();
  });

  it('calls updatePostedInvoiceLines for a posted invoice', async () => {
    const { result } = setup();
    await act(() => result.current.handleSaveEdit(postedInvoice, editLines, 'note'));
    expect(updatePostedInvoiceLines).toHaveBeenCalled();
    expect(updateInvoice).not.toHaveBeenCalled();
  });

  it('includes the edited invoiceDate in the posted invoice payload', async () => {
    const { result } = setup();
    const date = new Date('2026-02-15');
    await act(() => result.current.handleSaveEdit(postedInvoice, editLines, 'note', date));
    const payload = updatePostedInvoiceLines.mock.calls[0]![0];
    expect(payload.invoiceDate).toEqual(date);
  });

  it('shows a success toast after saving an edit', async () => {
    const { result } = setup();
    await act(() => result.current.handleSaveEdit(draftInvoice, editLines, 'note'));
    expect(toast.success).toHaveBeenCalled();
  });

  it('shows an error toast and rethrows when saving an edit fails', async () => {
    updateInvoice.mockRejectedValue(new Error('boom'));
    const { result } = setup();
    await expect(
      act(() => result.current.handleSaveEdit(draftInvoice, editLines, 'note')),
    ).rejects.toThrow('boom');
    expect(toast.error).toHaveBeenCalled();
  });

  it('shows a success toast after saving metadata', async () => {
    const { result } = setup();
    await act(() =>
      result.current.handleMetadataSave('inv-draft', {
        supplierId: null,
        invoiceNumber: 'INV-1',
        invoiceDate: null,
        note: '',
      }),
    );
    expect(toast.success).toHaveBeenCalled();
  });

  it('shows an error toast and rethrows when saving metadata fails', async () => {
    updateInvoiceMetadata.mockRejectedValue(new Error('boom'));
    const { result } = setup();
    await expect(
      act(() =>
        result.current.handleMetadataSave('inv-draft', {
          supplierId: null,
          invoiceNumber: 'INV-1',
          invoiceDate: null,
          note: '',
        }),
      ),
    ).rejects.toThrow('boom');
    expect(toast.error).toHaveBeenCalled();
  });
});

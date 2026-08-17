import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { InvoiceStatus } from '@reyogo/types';
import type { ICapturedInvoiceWithLines } from '@reyogo/types';

const getInvoice = vi.fn();
const navigateToInvoice = vi.fn();

vi.mock('@/services/invoice', () => ({
  invoiceService: {
    getInvoice: (...args: unknown[]) => getInvoice(...args),
  },
}));

vi.mock('../../../hooks/useNavigateToInvoice', () => ({
  useNavigateToInvoice: () => ({ navigateToInvoice, conflictModal: null }),
}));

import { useInvoiceDetailHandlers } from '.';
import { RowModeKind } from '../../types';

const draftInvoice: ICapturedInvoiceWithLines = {
  id: 'inv-draft',
  entityId: 'default',
  supplierId: null,
  sourceInvoiceId: null,
  invoiceNumber: 'INV-D',
  invoiceDate: null,
  status: InvoiceStatus.Draft,
  vatMode: 'exclusive' as ICapturedInvoiceWithLines['vatMode'],
  vatRate: 15,
  createdAt: new Date(),
  updatedAt: null,
  lines: [],
};

const postedInvoice: ICapturedInvoiceWithLines = {
  ...draftInvoice,
  id: 'inv-posted',
  status: InvoiceStatus.Posted,
};

function setup() {
  const setMode = vi.fn();
  const setDetailCache = vi.fn();
  const { result } = renderHook(() =>
    useInvoiceDetailHandlers({
      detailCache: {},
      setDetailCache,
      rowMode: {},
      setMode,
    }),
  );
  return { result, setMode };
}

beforeEach(() => {
  getInvoice.mockReset();
});

describe('useInvoiceDetailHandlers', () => {
  it('handleEditClick opens full Edit mode for a draft invoice', async () => {
    getInvoice.mockResolvedValue(draftInvoice);
    const { result, setMode } = setup();

    await act(() => result.current.handleEditClick('inv-draft'));

    expect(setMode).toHaveBeenCalledWith('inv-draft', { kind: RowModeKind.Edit });
  });

  it('handleEditClick opens full Edit mode for a posted invoice too', async () => {
    getInvoice.mockResolvedValue(postedInvoice);
    const { result, setMode } = setup();

    await act(() => result.current.handleEditClick('inv-posted'));

    expect(setMode).toHaveBeenCalledWith('inv-posted', { kind: RowModeKind.Edit });
  });

  it('handleEditDetailsClick opens MetadataEdit mode', async () => {
    getInvoice.mockResolvedValue(postedInvoice);
    const { result, setMode } = setup();

    await act(() => result.current.handleEditDetailsClick('inv-posted'));

    expect(setMode).toHaveBeenCalledWith('inv-posted', { kind: RowModeKind.MetadataEdit });
  });
});

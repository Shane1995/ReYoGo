import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { VatMode } from '@reyogo/types';
import type { IScannedInvoice } from '@reyogo/types';

vi.mock('@/services/aiSettings', () => ({
  aiSettingsService: { getKeyStatus: vi.fn().mockResolvedValue({ configured: true }) },
}));

vi.mock('@/services/invoiceScan', () => ({
  invoiceScanService: { scan: vi.fn() },
}));

vi.mock('../../utils/fileToBase64', () => ({
  fileToBase64: vi.fn().mockResolvedValue('base64data'),
}));

import { useInvoiceScan } from './index';
import { aiSettingsService } from '@/services/aiSettings';
import { invoiceScanService } from '@/services/invoiceScan';

const items = [{ id: 'item-1', name: 'Tomatoes' }];
const suppliers = [{ id: 'sup-1', name: 'Acme Foods' }];

const BLANK_INVOICE: IScannedInvoice = {
  supplierName: null,
  supplierNameConfidence: 'low',
  invoiceDate: null,
  invoiceDateConfidence: 'low',
  invoiceNumber: null,
  invoiceNumberConfidence: 'low',
  vatMode: null,
  invoiceTotal: null,
  lines: [],
  confidence: 'high',
};

function makeParams(overrides: Partial<Parameters<typeof useInvoiceScan>[0]> = {}) {
  return {
    itemsWithCategory: items,
    suppliers,
    setInvoiceNumber: vi.fn(),
    setInvoiceDate: vi.fn(),
    setSupplierId: vi.fn(),
    setVatMode: vi.fn(),
    setLines: vi.fn(),
    ...overrides,
  };
}

function makeFile(type = 'image/png', size = 100) {
  return new File([new Uint8Array(size)], 'invoice.png', { type });
}

describe('useInvoiceScan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    URL.revokeObjectURL = vi.fn();
    vi.mocked(aiSettingsService.getKeyStatus).mockResolvedValue({ configured: true });
  });

  it('loads the configured state on mount', async () => {
    const { result } = renderHook(() => useInvoiceScan(makeParams()));
    await waitFor(() => expect(result.current.configured).toBe(true));
  });

  it('rejects an unsupported file type without entering preview', async () => {
    const { result } = renderHook(() => useInvoiceScan(makeParams()));
    await waitFor(() => expect(result.current.configured).toBe(true));

    act(() => result.current.handleFileSelected(makeFile('image/gif')));

    expect(result.current.status).toBe('error');
    expect(result.current.errorMessage).toMatch(/unsupported file type/i);
    expect(result.current.selectedFile).toBeNull();
    expect(invoiceScanService.scan).not.toHaveBeenCalled();
  });

  it('rejects an oversized file without entering preview', async () => {
    const { result } = renderHook(() => useInvoiceScan(makeParams()));
    await waitFor(() => expect(result.current.configured).toBe(true));

    act(() => result.current.handleFileSelected(makeFile('image/png', 11 * 1024 * 1024)));

    expect(result.current.status).toBe('error');
    expect(result.current.errorMessage).toMatch(/size limit/i);
    expect(invoiceScanService.scan).not.toHaveBeenCalled();
  });

  it('enters a preview state on a valid file without scanning yet', async () => {
    const { result } = renderHook(() => useInvoiceScan(makeParams()));
    await waitFor(() => expect(result.current.configured).toBe(true));

    act(() => result.current.handleFileSelected(makeFile()));

    expect(result.current.status).toBe('preview');
    expect(result.current.selectedFile).not.toBeNull();
    expect(result.current.previewUrl).toBe('blob:mock-url');
    expect(invoiceScanService.scan).not.toHaveBeenCalled();
  });

  it('chooseDifferentFile returns to idle and clears the selection', async () => {
    const { result } = renderHook(() => useInvoiceScan(makeParams()));
    await waitFor(() => expect(result.current.configured).toBe(true));

    act(() => result.current.handleFileSelected(makeFile()));
    act(() => result.current.chooseDifferentFile());

    expect(result.current.status).toBe('idle');
    expect(result.current.selectedFile).toBeNull();
    expect(result.current.previewUrl).toBeNull();
  });

  it('only calls the scan service once the preview is confirmed', async () => {
    vi.mocked(invoiceScanService.scan).mockResolvedValue({
      invoice: {
        ...BLANK_INVOICE,
        supplierName: 'Acme Foods',
        supplierNameConfidence: 'high',
        invoiceDate: '2026-07-01',
        invoiceDateConfidence: 'high',
        invoiceNumber: 'INV-1',
        invoiceNumberConfidence: 'high',
        vatMode: VatMode.Inclusive,
        invoiceTotal: 10,
        lines: [
          {
            description: 'Tomatoes',
            quantity: 4,
            unitPrice: 2.5,
            isVatable: true,
            quantityConfidence: 'high',
            unitPriceConfidence: 'high',
          },
        ],
        confidence: 'high',
      },
      usage: { inputTokens: 100, outputTokens: 20, estimatedCostUsd: 0.0002 },
    });
    const params = makeParams();
    const { result } = renderHook(() => useInvoiceScan(params));
    await waitFor(() => expect(result.current.configured).toBe(true));

    act(() => result.current.handleFileSelected(makeFile()));
    expect(invoiceScanService.scan).not.toHaveBeenCalled();

    await act(() => result.current.confirmScan());

    expect(invoiceScanService.scan).toHaveBeenCalledOnce();
    expect(params.setInvoiceNumber).toHaveBeenCalledWith('INV-1');
    expect(params.setLines).toHaveBeenCalledWith([
      expect.objectContaining({
        itemId: 'item-1',
        quantity: 4,
        totalVatExclude: 10,
        isVatable: true,
        needsReview: false,
        quantityNeedsReview: false,
        totalNeedsReview: false,
        taxNeedsReview: false,
      }),
    ]);
    expect(result.current.status).toBe('idle');
    expect(result.current.modalOpen).toBe(false);
    expect(result.current.headerReview).toEqual({
      supplier: false,
      date: false,
      invoiceNumber: false,
    });
    expect(result.current.lastSummary?.reviewNotes).toEqual([]);
    expect(result.current.lastSummary?.totalMismatch).toBeNull();
    expect(result.current.lastSummary?.confidence).toBe('high');
    expect(result.current.lastSummary?.scannedAt).toBeInstanceOf(Date);
    expect(result.current.lastSummary?.previewUrl).toBe('blob:mock-url');
    expect(result.current.lastSummary?.fileName).toBe('invoice.png');
    expect(result.current.lastSummary?.mimeType).toBe('image/png');
  });

  it('flags header fields that were null or came back with less than high confidence', async () => {
    vi.mocked(invoiceScanService.scan).mockResolvedValue({
      invoice: {
        ...BLANK_INVOICE,
        supplierName: 'Unknown Co',
        supplierNameConfidence: 'medium',
        invoiceDate: '2026-07-01',
        invoiceDateConfidence: 'high',
      },
      usage: { inputTokens: 1, outputTokens: 1, estimatedCostUsd: 0 },
    });
    const params = makeParams();
    const { result } = renderHook(() => useInvoiceScan(params));
    await waitFor(() => expect(result.current.configured).toBe(true));

    act(() => result.current.handleFileSelected(makeFile()));
    await act(() => result.current.confirmScan());

    // supplier: name present but medium confidence, and no supplier matched the name -> flagged
    // date: present with high confidence -> not flagged
    // invoiceNumber: null -> flagged
    expect(result.current.headerReview).toEqual({
      supplier: true,
      date: false,
      invoiceNumber: true,
    });
  });

  it('clearing the invoice number field clears its own review flag only', async () => {
    vi.mocked(invoiceScanService.scan).mockResolvedValue({
      invoice: BLANK_INVOICE,
      usage: { inputTokens: 1, outputTokens: 1, estimatedCostUsd: 0 },
    });
    const params = makeParams();
    const { result } = renderHook(() => useInvoiceScan(params));
    await waitFor(() => expect(result.current.configured).toBe(true));
    act(() => result.current.handleFileSelected(makeFile()));
    await act(() => result.current.confirmScan());
    expect(result.current.headerReview).toEqual({
      supplier: true,
      date: true,
      invoiceNumber: true,
    });

    act(() => result.current.handleInvoiceNumberChange('INV-99'));

    expect(params.setInvoiceNumber).toHaveBeenCalledWith('INV-99');
    expect(result.current.headerReview).toEqual({
      supplier: true,
      date: true,
      invoiceNumber: false,
    });
  });

  it('flags low-confidence quantity/price fields and a total mismatch', async () => {
    vi.mocked(invoiceScanService.scan).mockResolvedValue({
      invoice: {
        ...BLANK_INVOICE,
        invoiceTotal: 999,
        lines: [
          {
            description: 'Mystery Widget',
            quantity: 1,
            unitPrice: 9.99,
            isVatable: false,
            quantityConfidence: 'medium',
            unitPriceConfidence: 'low',
          },
        ],
        confidence: 'low',
      },
      usage: { inputTokens: 50, outputTokens: 10, estimatedCostUsd: 0.0001 },
    });
    const params = makeParams();
    const { result } = renderHook(() => useInvoiceScan(params));
    await waitFor(() => expect(result.current.configured).toBe(true));

    act(() => result.current.handleFileSelected(makeFile()));
    await act(() => result.current.confirmScan());

    expect(params.setLines).toHaveBeenCalledWith([
      expect.objectContaining({
        itemId: '',
        isVatable: false,
        needsReview: true,
        quantityNeedsReview: true,
        totalNeedsReview: true,
        taxNeedsReview: true,
      }),
    ]);
    expect(result.current.lastSummary?.totalMismatch).toEqual({
      computedTotal: 9.99,
      invoiceTotal: 999,
      difference: -989.01,
    });
  });

  it('defaults isVatable to true and does not flag it for review when the document is silent on tax status', async () => {
    vi.mocked(invoiceScanService.scan).mockResolvedValue({
      invoice: {
        ...BLANK_INVOICE,
        lines: [
          {
            description: 'Widget',
            quantity: 1,
            unitPrice: 1,
            isVatable: null,
            quantityConfidence: 'high',
            unitPriceConfidence: 'high',
          },
        ],
      },
      usage: { inputTokens: 1, outputTokens: 1, estimatedCostUsd: 0 },
    });
    const params = makeParams();
    const { result } = renderHook(() => useInvoiceScan(params));
    await waitFor(() => expect(result.current.configured).toBe(true));

    act(() => result.current.handleFileSelected(makeFile()));
    await act(() => result.current.confirmScan());

    expect(params.setLines).toHaveBeenCalledWith([
      expect.objectContaining({ isVatable: true, taxNeedsReview: false }),
    ]);
  });

  it('sets an error status when the scan service rejects, keeping the file for retry', async () => {
    vi.mocked(invoiceScanService.scan).mockRejectedValue(
      new Error('No Anthropic API key is configured.'),
    );
    const { result } = renderHook(() => useInvoiceScan(makeParams()));
    await waitFor(() => expect(result.current.configured).toBe(true));

    act(() => result.current.handleFileSelected(makeFile()));
    await act(() => result.current.confirmScan());

    expect(result.current.status).toBe('error');
    expect(result.current.errorMessage).toBe('No Anthropic API key is configured.');
    expect(result.current.selectedFile).not.toBeNull();
  });

  it('clearSummary resets the last scan summary', async () => {
    vi.mocked(invoiceScanService.scan).mockResolvedValue({
      invoice: BLANK_INVOICE,
      usage: { inputTokens: 1, outputTokens: 1, estimatedCostUsd: 0 },
    });
    const { result } = renderHook(() => useInvoiceScan(makeParams()));
    await waitFor(() => expect(result.current.configured).toBe(true));
    act(() => result.current.handleFileSelected(makeFile()));
    await act(() => result.current.confirmScan());
    expect(result.current.lastSummary).not.toBeNull();

    act(() => result.current.clearSummary());

    expect(result.current.lastSummary).toBeNull();
  });
});

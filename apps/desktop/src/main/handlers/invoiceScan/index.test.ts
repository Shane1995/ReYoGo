import { describe, it, expect, vi, beforeEach } from 'vitest';

const { registeredHandlers, mockScanInvoiceImage } = vi.hoisted(() => {
  const registeredHandlers = new Map<string, (...args: unknown[]) => unknown>();
  return {
    registeredHandlers,
    mockScanInvoiceImage: vi.fn(),
  };
});

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: (...args: unknown[]) => unknown) => {
      registeredHandlers.set(channel, handler);
    }),
  },
}));

vi.mock('../../lib/invoiceScanner', () => ({
  scanInvoiceImage: mockScanInvoiceImage,
}));

import { registerInvoiceScanHandlers } from './index';

describe('registerInvoiceScanHandlers', () => {
  beforeEach(() => {
    registeredHandlers.clear();
    vi.clearAllMocks();
    registerInvoiceScanHandlers();
  });

  it('registers without throwing', () => {
    expect(() => registerInvoiceScanHandlers()).not.toThrow();
  });

  it('delegates to scanInvoiceImage with the given payload', async () => {
    mockScanInvoiceImage.mockResolvedValue({ invoice: {}, usage: {} });
    const handler = registeredHandlers.get('invoice-scan:scan')!;

    const result = await handler(null, { base64: 'abc', mimeType: 'image/png' });

    expect(mockScanInvoiceImage).toHaveBeenCalledWith({ base64: 'abc', mimeType: 'image/png' });
    expect(result).toEqual({ invoice: {}, usage: {} });
  });
});

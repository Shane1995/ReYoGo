import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { InvoiceStatus } from '@reyogo/types';
import type { ICapturedInvoiceWithLines } from '@reyogo/types';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext', () => ({
  useInventory: () => ({ items: [] }),
}));

vi.mock('@/services/suppliers', () => ({
  suppliersService: {
    getSuppliers: vi.fn().mockResolvedValue([]),
  },
}));

const mockInvoke = vi.fn();
Object.defineProperty(window, 'electronAPI', {
  value: { ipcRenderer: { invoke: mockInvoke } },
  writable: true,
  configurable: true,
});

import { useInvoiceHistory } from './index';

function makeInvoice(
  overrides: Partial<ICapturedInvoiceWithLines> = {},
): ICapturedInvoiceWithLines {
  return {
    id: 'inv-1',
    supplierId: null,
    invoiceNumber: null,
    invoiceDate: null,
    status: InvoiceStatus.Draft,
    vatMode: 'exclusive',
    vatRate: 15,
    createdAt: new Date('2026-01-15'),
    updatedAt: null,
    lines: [],
    ...overrides,
  };
}

beforeEach(() => {
  mockInvoke.mockResolvedValue([]);
});

describe('useInvoiceHistory', () => {
  describe('initial state', () => {
    it('starts loading and resolves to empty list', async () => {
      const { result } = renderHook(() => useInvoiceHistory());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.invoices).toHaveLength(0);
    });

    it('exposes empty filter defaults', async () => {
      const { result } = renderHook(() => useInvoiceHistory());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.search).toBe('');
      expect(result.current.fromDate).toBe('');
      expect(result.current.toDate).toBe('');
      expect(result.current.supplierFilter).toBe('');
      expect(result.current.hasFilters).toBe(false);
    });
  });

  describe('search filtering', () => {
    it('returns invoices whose item names match the search term', async () => {
      const inv = makeInvoice({
        id: 'inv-1',
        lines: [
          {
            id: 'l1',
            invoiceId: 'inv-1',
            itemId: 'i1',
            itemNameSnapshot: 'Chicken Breast',
            quantity: 1,
            isVatable: true,
            totalVatExclude: 100,
          },
        ],
      });
      mockInvoke.mockResolvedValue([inv]);

      const { result } = renderHook(() => useInvoiceHistory());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.setSearch('chicken'));
      expect(result.current.invoices).toHaveLength(1);

      act(() => result.current.setSearch('beef'));
      expect(result.current.invoices).toHaveLength(0);
    });

    it('matches on invoice number too', async () => {
      const inv = makeInvoice({ id: 'inv-1', invoiceNumber: 'INV-0042', lines: [] });
      mockInvoke.mockResolvedValue([inv]);

      const { result } = renderHook(() => useInvoiceHistory());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.setSearch('INV-0042'));
      expect(result.current.invoices).toHaveLength(1);

      act(() => result.current.setSearch('INV-9999'));
      expect(result.current.invoices).toHaveLength(0);
    });
  });

  describe('date range filtering', () => {
    it('excludes invoices before fromDate', async () => {
      const inv = makeInvoice({
        id: 'inv-1',
        invoiceDate: new Date('2026-01-10'),
      });
      mockInvoke.mockResolvedValue([inv]);

      const { result } = renderHook(() => useInvoiceHistory());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.setFromDate('2026-01-15'));
      expect(result.current.invoices).toHaveLength(0);
    });

    it('excludes invoices after toDate', async () => {
      const inv = makeInvoice({
        id: 'inv-1',
        invoiceDate: new Date('2026-03-01'),
      });
      mockInvoke.mockResolvedValue([inv]);

      const { result } = renderHook(() => useInvoiceHistory());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.setToDate('2026-02-28'));
      expect(result.current.invoices).toHaveLength(0);
    });

    it('includes invoices within the date range', async () => {
      const inv = makeInvoice({
        id: 'inv-1',
        invoiceDate: new Date('2026-02-15'),
      });
      mockInvoke.mockResolvedValue([inv]);

      const { result } = renderHook(() => useInvoiceHistory());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.setFromDate('2026-02-01');
        result.current.setToDate('2026-02-28');
      });
      expect(result.current.invoices).toHaveLength(1);
    });

    it('falls back to createdAt when invoiceDate is null', async () => {
      const inv = makeInvoice({
        id: 'inv-1',
        invoiceDate: null,
        createdAt: new Date('2026-01-05'),
      });
      mockInvoke.mockResolvedValue([inv]);

      const { result } = renderHook(() => useInvoiceHistory());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.setFromDate('2026-01-10'));
      expect(result.current.invoices).toHaveLength(0);
    });
  });

  describe('supplier filtering', () => {
    it('excludes invoices not matching the supplier', async () => {
      const inv = makeInvoice({ id: 'inv-1', supplierId: 'sup-A' });
      mockInvoke.mockResolvedValue([inv]);

      const { result } = renderHook(() => useInvoiceHistory());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.setSupplierFilter('sup-B'));
      expect(result.current.invoices).toHaveLength(0);

      act(() => result.current.setSupplierFilter('sup-A'));
      expect(result.current.invoices).toHaveLength(1);
    });
  });

  describe('hasFilters / clearFilters', () => {
    it('hasFilters is true when any filter is non-empty', async () => {
      const { result } = renderHook(() => useInvoiceHistory());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.setSearch('test'));
      expect(result.current.hasFilters).toBe(true);
    });

    it('clearFilters resets all filter state', async () => {
      const { result } = renderHook(() => useInvoiceHistory());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.setSearch('test');
        result.current.setFromDate('2026-01-01');
        result.current.setToDate('2026-12-31');
        result.current.setSupplierFilter('sup-A');
      });
      act(() => result.current.clearFilters());

      expect(result.current.search).toBe('');
      expect(result.current.fromDate).toBe('');
      expect(result.current.toDate).toBe('');
      expect(result.current.supplierFilter).toBe('');
      expect(result.current.hasFilters).toBe(false);
    });
  });
});

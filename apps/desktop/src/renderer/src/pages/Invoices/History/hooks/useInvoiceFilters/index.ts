import { useState, useCallback } from 'react';
import type { ICapturedInvoice, ICapturedInvoiceWithLines } from '@reyogo/types';
import { toDateStr } from '../../utils/toDateStr';

export type InvoiceFiltersState = {
  search: string;
  setSearch: (v: string) => void;
  fromDate: string;
  setFromDate: (v: string) => void;
  toDate: string;
  setToDate: (v: string) => void;
  supplierFilter: string;
  setSupplierFilter: (v: string) => void;
  hasFilters: boolean;
  clearFilters: () => void;
  filterInvoices: (
    invoices: ICapturedInvoice[],
    detailCache: Record<string, ICapturedInvoiceWithLines>,
  ) => ICapturedInvoice[];
};

function applyInvoiceFilters(
  invoices: ICapturedInvoice[],
  detailCache: Record<string, ICapturedInvoiceWithLines>,
  filters: { search: string; fromDate: string; toDate: string; supplierFilter: string },
): ICapturedInvoice[] {
  let result = invoices;

  const q = filters.search.trim().toLowerCase();
  if (q) {
    result = result.filter((inv) => {
      const detail = detailCache[inv.id];
      const matchesItem = detail?.lines.some((l) => l.itemNameSnapshot.toLowerCase().includes(q));
      const matchesNumber = inv.invoiceNumber?.toLowerCase().includes(q);
      return matchesItem || matchesNumber;
    });
  }

  if (filters.fromDate || filters.toDate) {
    result = result.filter((inv) => {
      const d = toDateStr(inv.invoiceDate ?? inv.createdAt);
      if (filters.fromDate && d < filters.fromDate) return false;
      if (filters.toDate && d > filters.toDate) return false;
      return true;
    });
  }

  if (filters.supplierFilter) {
    result = result.filter((inv) => inv.supplierId === filters.supplierFilter);
  }

  return result;
}

export function useInvoiceFilters(): InvoiceFiltersState {
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');

  const hasFilters = !!(search || fromDate || toDate || supplierFilter);

  const clearFilters = useCallback(() => {
    setSearch('');
    setFromDate('');
    setToDate('');
    setSupplierFilter('');
  }, []);

  const filterInvoices = useCallback(
    (invoices: ICapturedInvoice[], detailCache: Record<string, ICapturedInvoiceWithLines>) =>
      applyInvoiceFilters(invoices, detailCache, {
        search,
        fromDate,
        toDate,
        supplierFilter,
      }),
    [search, fromDate, toDate, supplierFilter],
  );

  return {
    search,
    setSearch,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    supplierFilter,
    setSupplierFilter,
    hasFilters,
    clearFilters,
    filterInvoices,
  };
}

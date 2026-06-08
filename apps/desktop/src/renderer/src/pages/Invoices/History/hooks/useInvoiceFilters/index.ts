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

function matchesSearchQuery(
  inv: ICapturedInvoice,
  detail: ICapturedInvoiceWithLines | undefined,
  q: string,
): boolean {
  if (inv.invoiceNumber?.toLowerCase().includes(q)) return true;
  if (!detail) return false;
  return detail.lines.some((l) => l.itemNameSnapshot.toLowerCase().includes(q));
}

function isAfterFromDate(d: string, fromDate: string): boolean {
  if (!fromDate) return true;
  return d >= fromDate;
}

function isBeforeToDate(d: string, toDate: string): boolean {
  if (!toDate) return true;
  return d <= toDate;
}

function isInDateRange(inv: ICapturedInvoice, fromDate: string, toDate: string): boolean {
  const d = toDateStr(inv.invoiceDate ?? inv.createdAt);
  if (!isAfterFromDate(d, fromDate)) return false;
  return isBeforeToDate(d, toDate);
}

function filterBySearch(
  invoices: ICapturedInvoice[],
  detailCache: Record<string, ICapturedInvoiceWithLines>,
  search: string,
): ICapturedInvoice[] {
  const q = search.trim().toLowerCase();
  if (!q) return invoices;
  return invoices.filter((inv) => matchesSearchQuery(inv, detailCache[inv.id], q));
}

function filterByDateRange(
  invoices: ICapturedInvoice[],
  fromDate: string,
  toDate: string,
): ICapturedInvoice[] {
  if (!fromDate && !toDate) return invoices;
  return invoices.filter((inv) => isInDateRange(inv, fromDate, toDate));
}

function filterBySupplier(
  invoices: ICapturedInvoice[],
  supplierFilter: string,
): ICapturedInvoice[] {
  if (!supplierFilter) return invoices;
  return invoices.filter((inv) => inv.supplierId === supplierFilter);
}

function applyInvoiceFilters(
  invoices: ICapturedInvoice[],
  detailCache: Record<string, ICapturedInvoiceWithLines>,
  filters: { search: string; fromDate: string; toDate: string; supplierFilter: string },
): ICapturedInvoice[] {
  const searched = filterBySearch(invoices, detailCache, filters.search);
  const dateFiltered = filterByDateRange(searched, filters.fromDate, filters.toDate);
  return filterBySupplier(dateFiltered, filters.supplierFilter);
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

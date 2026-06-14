import { useState, useCallback, useEffect, useMemo } from 'react';
import type { ICapturedInvoice, ICapturedInvoiceWithLines, Supplier } from '@reyogo/types';
import { useEntities } from '@/Context/EntityContext';
import { suppliersService } from '@/services/suppliers';
import { invoiceService } from '@/services/invoice';
import { lineToEditLine } from '../../../utils/lineToEditLine';
import { type RowMode } from '../../types';
import { useInvoiceFilters } from '../useInvoiceFilters';
import { useInvoiceActions } from '../useInvoiceActions';

function useLoadInvoices() {
  const [invoices, setInvoices] = useState<ICapturedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailCache, setDetailCache] = useState<Record<string, ICapturedInvoiceWithLines>>({});

  const loadInvoices = useCallback(async () => {
    const list = await invoiceService.getInvoicesWithLines();
    setInvoices(list);
    setDetailCache((prev) => {
      const next = { ...prev };
      for (const inv of list) next[inv.id] = inv;
      return next;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadInvoices();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadInvoices]);

  return { invoices, loading, detailCache, setDetailCache, loadInvoices };
}

function useLoadSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const { entities } = useEntities();
  const entityIds = entities.map((e) => e.id).join(',');

  useEffect(() => {
    if (!entities.length) return;
    Promise.all(entities.map((e) => suppliersService.getSuppliers(e.id)))
      .then((results) => setSuppliers(results.flat()))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityIds]);

  return suppliers;
}

export function useInvoiceHistory() {
  const { invoices, loading, detailCache, setDetailCache, loadInvoices } = useLoadInvoices();
  const [rowMode, setRowModeState] = useState<Record<string, RowMode>>({});
  const suppliers = useLoadSuppliers();
  const filters = useInvoiceFilters();

  const setMode = useCallback((id: string, mode: RowMode) => {
    setRowModeState((prev) => ({ ...prev, [id]: mode }));
  }, []);

  const actions = useInvoiceActions({
    detailCache,
    setDetailCache,
    rowMode,
    loadInvoices,
    setMode,
  });

  const { filterInvoices } = filters;
  const filteredInvoices = useMemo(
    () => filterInvoices(invoices, detailCache),
    [filterInvoices, invoices, detailCache],
  );

  return {
    invoices: filteredInvoices,
    loading,
    detailCache,
    rowMode,
    setMode,
    search: filters.search,
    setSearch: filters.setSearch,
    fromDate: filters.fromDate,
    setFromDate: filters.setFromDate,
    toDate: filters.toDate,
    setToDate: filters.setToDate,
    supplierFilter: filters.supplierFilter,
    setSupplierFilter: filters.setSupplierFilter,
    suppliers,
    hasFilters: filters.hasFilters,
    clearFilters: filters.clearFilters,
    ...actions,
    lineToEditLine,
  };
}

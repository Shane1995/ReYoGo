import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoicesIPC } from '@shared/types/ipc';
import type { ICapturedInvoice, ICapturedInvoiceWithLines } from '@reyogo/types';
import type { Supplier } from '@reyogo/types';
import { InvoiceRoutes } from '@/components/AppRoutes/routePaths';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { suppliersService } from '@/services/suppliers';
import type { ProcessReceiptLine } from '../../../types';
import { getProcessLineComputed } from '../../../types';
import { lineToEditLine } from '../../../utils/lineToEditLine';

export type RowMode = { kind: 'view' } | { kind: 'detail' } | { kind: 'edit' } | { kind: 'audit' };

function toDateStr(d: Date | string | null | undefined): string {
  if (!d) return '';
  const s = typeof d === 'string' ? d : d.toISOString();
  return s.slice(0, 10);
}

export function useInvoiceHistory() {
  const [invoices, setInvoices] = useState<ICapturedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailCache, setDetailCache] = useState<Record<string, ICapturedInvoiceWithLines>>({});
  const [rowMode, setRowModeState] = useState<Record<string, RowMode>>({});
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const { items } = useInventory();
  const navigate = useNavigate();

  const loadInvoices = useCallback(async () => {
    const list: ICapturedInvoiceWithLines[] = (await window.electronAPI.ipcRenderer.invoke(
      InvoicesIPC.GET_INVOICES_WITH_LINES,
    )) as unknown as ICapturedInvoiceWithLines[];
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

  useEffect(() => {
    suppliersService
      .getSuppliers()
      .then((s) => setSuppliers((s as unknown as Supplier[]) ?? []))
      .catch(() => {});
  }, []);

  const getDetail = useCallback(
    async (id: string): Promise<ICapturedInvoiceWithLines | null> => {
      if (detailCache[id]) return detailCache[id];
      const inv = (await window.electronAPI.ipcRenderer.invoke(
        InvoicesIPC.GET_INVOICE,
        id,
      )) as unknown as ICapturedInvoiceWithLines | null;
      if (inv) setDetailCache((prev) => ({ ...prev, [id]: inv }));
      return inv ?? null;
    },
    [detailCache],
  );

  const setMode = useCallback((id: string, mode: RowMode) => {
    setRowModeState((prev) => ({ ...prev, [id]: mode }));
  }, []);

  const handleReuse = useCallback(
    async (id: string) => {
      let detail = detailCache[id];
      if (!detail) {
        const inv = (await window.electronAPI.ipcRenderer.invoke(
          InvoicesIPC.GET_INVOICE,
          id,
        )) as unknown as ICapturedInvoiceWithLines | null;
        if (inv) {
          setDetailCache((prev) => ({ ...prev, [id]: inv }));
          detail = inv;
        }
      }
      if (!detail) return;
      const templateLines = detail.lines.map((l) => ({
        id: window.crypto.randomUUID(),
        itemId: l.itemId,
        quantity: 0,
        isVatable: l.isVatable,
        totalVatExclude: 0,
      }));
      navigate(InvoiceRoutes.Base, { state: { templateLines } });
    },
    [detailCache, navigate],
  );

  const handleExpandDetail = useCallback(
    async (id: string) => {
      const current = rowMode[id];
      if (current?.kind === 'detail') {
        setMode(id, { kind: 'view' });
        return;
      }
      await getDetail(id);
      setMode(id, { kind: 'detail' });
    },
    [rowMode, getDetail, setMode],
  );

  const handleEditClick = useCallback(
    async (id: string) => {
      await getDetail(id);
      setMode(id, { kind: 'edit' });
    },
    [getDetail, setMode],
  );

  const handleAuditClick = useCallback(
    (id: string) => {
      setMode(id, { kind: 'audit' });
    },
    [setMode],
  );

  const handleSaveEdit = useCallback(
    async (invoice: ICapturedInvoice, editLines: ProcessReceiptLine[], note: string) => {
      const payload = {
        id: invoice.id,
        note: note || undefined,
        vatMode: invoice.vatMode,
        vatRate: invoice.vatRate,
        lines: editLines.map((line) => {
          const computed = getProcessLineComputed(line, invoice.vatMode, invoice.vatRate);
          return {
            id: line.id,
            itemId: line.itemId,
            itemNameSnapshot:
              items.find((i) => i.id === line.itemId)?.name ??
              detailCache[invoice.id]?.lines.find((l) => l.itemId === line.itemId)
                ?.itemNameSnapshot ??
              'Unknown',
            quantity: Number(line.quantity) || 0,
            isVatable: line.isVatable,
            totalVatExclude: computed.netTotal,
          };
        }),
      };
      await window.electronAPI.ipcRenderer.invoke(InvoicesIPC.UPDATE_INVOICE, payload);
      setDetailCache((prev) => {
        const next = { ...prev };
        delete next[invoice.id];
        return next;
      });
      await loadInvoices();
      setMode(invoice.id, { kind: 'view' });
    },
    [items, detailCache, loadInvoices, setMode],
  );

  const hasFilters = !!(search || fromDate || toDate || supplierFilter);

  const clearFilters = useCallback(() => {
    setSearch('');
    setFromDate('');
    setToDate('');
    setSupplierFilter('');
  }, []);

  const filteredInvoices = useMemo(() => {
    let result = invoices;

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((inv) => {
        const detail = detailCache[inv.id];
        const matchesItem = detail?.lines.some((l) => l.itemNameSnapshot.toLowerCase().includes(q));
        const matchesNumber = inv.invoiceNumber?.toLowerCase().includes(q);
        return matchesItem || matchesNumber;
      });
    }

    if (fromDate || toDate) {
      result = result.filter((inv) => {
        const d = toDateStr(inv.invoiceDate ?? inv.createdAt);
        if (fromDate && d < fromDate) return false;
        if (toDate && d > toDate) return false;
        return true;
      });
    }

    if (supplierFilter) {
      result = result.filter((inv) => inv.supplierId === supplierFilter);
    }

    return result;
  }, [invoices, detailCache, search, fromDate, toDate, supplierFilter]);

  return {
    invoices: filteredInvoices,
    loading,
    detailCache,
    rowMode,
    setMode,
    search,
    setSearch,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    supplierFilter,
    setSupplierFilter,
    suppliers,
    hasFilters,
    clearFilters,
    handleReuse,
    handleExpandDetail,
    handleEditClick,
    handleAuditClick,
    handleSaveEdit,
    lineToEditLine,
  };
}

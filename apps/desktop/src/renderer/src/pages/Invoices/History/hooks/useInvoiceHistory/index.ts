import { useState, useCallback, useEffect, useMemo } from 'react';
import type {
  ICapturedInvoice,
  ICapturedInvoiceWithLines,
  ISaveCreditNotePayload,
  Supplier,
} from '@reyogo/types';
import { InvoiceStatus } from '@reyogo/types';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { useNavigateToInvoice } from '../../../hooks/useNavigateToInvoice';
import { useEntities } from '@/Context/EntityContext';
import { suppliersService } from '@/services/suppliers';
import { invoiceService } from '@/services/invoice';
import type { ProcessReceiptLine } from '../../../types';
import { getProcessLineComputed } from '../../../types';
import { lineToEditLine } from '../../../utils/lineToEditLine';
import { RowModeKind, type RowMode } from '../../types';
import { useInvoiceFilters } from '../useInvoiceFilters';

export function useInvoiceHistory() {
  const [invoices, setInvoices] = useState<ICapturedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailCache, setDetailCache] = useState<Record<string, ICapturedInvoiceWithLines>>({});
  const [rowMode, setRowModeState] = useState<Record<string, RowMode>>({});
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [postingId, setPostingId] = useState<string | null>(null);
  const [creditNoteSubmitting, setCreditNoteSubmitting] = useState(false);

  const {
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
  } = useInvoiceFilters();

  const { items } = useInventory();
  const { entities } = useEntities();
  const { navigateToInvoice, conflictModal } = useNavigateToInvoice();

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

  const entityIds = entities.map((e) => e.id).join(',');
  useEffect(() => {
    if (!entities.length) return;
    Promise.all(entities.map((e) => suppliersService.getSuppliers(e.id)))
      .then((results) => setSuppliers(results.flat()))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityIds]);

  const getDetail = useCallback(
    async (id: string): Promise<ICapturedInvoiceWithLines | null> => {
      if (detailCache[id]) return detailCache[id];
      const inv = await invoiceService.getInvoice(id);
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
        const inv = await invoiceService.getInvoice(id);
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
      navigateToInvoice(templateLines, { reuse: true });
    },
    [detailCache, navigateToInvoice],
  );

  const handleExpandDetail = useCallback(
    async (id: string) => {
      const current = rowMode[id];
      if (current?.kind === RowModeKind.Detail) {
        setMode(id, { kind: RowModeKind.View });
        return;
      }
      await getDetail(id);
      setMode(id, { kind: RowModeKind.Detail });
    },
    [rowMode, getDetail, setMode],
  );

  const handleEditClick = useCallback(
    async (id: string) => {
      const detail = await getDetail(id);
      const isPosted = detail?.status === InvoiceStatus.Posted;
      setMode(id, { kind: isPosted ? RowModeKind.MetadataEdit : RowModeKind.Edit });
    },
    [getDetail, setMode],
  );

  const handleAuditClick = useCallback(
    (id: string) => {
      setMode(id, { kind: RowModeKind.Audit });
    },
    [setMode],
  );

  const handlePost = useCallback(
    async (id: string) => {
      setPostingId(id);
      try {
        await invoiceService.postInvoice(id);
        setDetailCache((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        await loadInvoices();
      } finally {
        setPostingId(null);
      }
    },
    [loadInvoices],
  );

  const handleRaiseCreditNoteClick = useCallback(
    (id: string) => {
      setMode(id, { kind: RowModeKind.CreditNote });
    },
    [setMode],
  );

  const handleSaveCreditNote = useCallback(
    async (payload: ISaveCreditNotePayload) => {
      setCreditNoteSubmitting(true);
      try {
        await invoiceService.saveCreditNote(payload);
        await loadInvoices();
        setMode(payload.sourceInvoiceId, { kind: RowModeKind.View });
      } finally {
        setCreditNoteSubmitting(false);
      }
    },
    [loadInvoices, setMode],
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
            unitPrice: computed.netUnitPrice,
            isVatable: line.isVatable,
            totalVatExclude: computed.netTotal,
          };
        }),
      };
      await invoiceService.updateInvoice(payload);
      setDetailCache((prev) => {
        const next = { ...prev };
        delete next[invoice.id];
        return next;
      });
      await loadInvoices();
      setMode(invoice.id, { kind: RowModeKind.View });
    },
    [items, detailCache, loadInvoices, setMode],
  );

  const handleMetadataSave = useCallback(
    async (
      id: string,
      fields: {
        supplierId: string | null;
        invoiceNumber: string;
        invoiceDate: Date | null;
        note: string;
      },
    ) => {
      await invoiceService.updateInvoiceMetadata({
        id,
        supplierId: fields.supplierId,
        invoiceNumber: fields.invoiceNumber,
        invoiceDate: fields.invoiceDate,
        note: fields.note || undefined,
      });
      setDetailCache((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await loadInvoices();
      setMode(id, { kind: RowModeKind.View });
    },
    [loadInvoices, setMode],
  );

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
    handleMetadataSave,
    handlePost,
    postingId,
    handleRaiseCreditNoteClick,
    handleSaveCreditNote,
    creditNoteSubmitting,
    lineToEditLine,
    conflictModal,
  };
}

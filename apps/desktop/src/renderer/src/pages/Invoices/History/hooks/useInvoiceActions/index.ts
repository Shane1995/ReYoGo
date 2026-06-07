import { useState, useCallback } from 'react';
import type {
  ICapturedInvoice,
  ICapturedInvoiceWithLines,
  ISaveCreditNotePayload,
} from '@reyogo/types';
import { InvoiceStatus } from '@reyogo/types';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { useNavigateToInvoice } from '../../../hooks/useNavigateToInvoice';
import { invoiceService } from '@/services/invoice';
import type { ProcessReceiptLine } from '../../../types';
import { getProcessLineComputed } from '../../../types';
import { RowModeKind, type RowMode } from '../../types';

type Deps = {
  detailCache: Record<string, ICapturedInvoiceWithLines>;
  setDetailCache: React.Dispatch<React.SetStateAction<Record<string, ICapturedInvoiceWithLines>>>;
  rowMode: Record<string, RowMode>;
  loadInvoices: () => Promise<void>;
  setMode: (id: string, mode: RowMode) => void;
};

export function useInvoiceActions({
  detailCache,
  setDetailCache,
  rowMode,
  loadInvoices,
  setMode,
}: Deps) {
  const [postingId, setPostingId] = useState<string | null>(null);
  const [creditNoteSubmitting, setCreditNoteSubmitting] = useState(false);
  const { items } = useInventory();
  const { navigateToInvoice, conflictModal } = useNavigateToInvoice();

  const getDetail = useCallback(
    async (id: string): Promise<ICapturedInvoiceWithLines | null> => {
      if (detailCache[id]) return detailCache[id];
      const inv = await invoiceService.getInvoice(id);
      if (inv) setDetailCache((prev) => ({ ...prev, [id]: inv }));
      return inv ?? null;
    },
    [detailCache, setDetailCache],
  );

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
    [detailCache, setDetailCache, navigateToInvoice],
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
    [loadInvoices, setDetailCache],
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
    [items, detailCache, setDetailCache, loadInvoices, setMode],
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
    [setDetailCache, loadInvoices, setMode],
  );

  return {
    postingId,
    creditNoteSubmitting,
    conflictModal,
    handleReuse,
    handleExpandDetail,
    handleEditClick,
    handleAuditClick,
    handlePost,
    handleRaiseCreditNoteClick,
    handleSaveCreditNote,
    handleSaveEdit,
    handleMetadataSave,
  };
}

import { useCallback } from 'react';
import { toast } from 'sonner';
import { InvoiceStatus } from '@reyogo/types';
import type { ICapturedInvoice, ICapturedInvoiceWithLines } from '@reyogo/types';
import { invoiceService } from '@/services/invoice';
import { ipcErrorMessage } from '@/utils/ipcErrorMessage';
import type { ProcessReceiptLine } from '../../../types';
import { getProcessLineComputed } from '../../../types';
import { RowModeKind, type RowMode } from '../../types';

type SaveHandlerDeps = {
  items: { id: string; name: string }[];
  detailCache: Record<string, ICapturedInvoiceWithLines>;
  setDetailCache: React.Dispatch<React.SetStateAction<Record<string, ICapturedInvoiceWithLines>>>;
  loadInvoices: () => Promise<void>;
  setMode: (id: string, mode: RowMode) => void;
};

function itemNameSnapshotOf(
  itemId: string,
  invoiceId: string,
  items: { id: string; name: string }[],
  detailCache: Record<string, ICapturedInvoiceWithLines>,
): string {
  const fromItems = items.find((i) => i.id === itemId);
  if (fromItems) return fromItems.name;
  const fromDetail = detailCache[invoiceId]?.lines.find((l) => l.itemId === itemId);
  if (fromDetail) return fromDetail.itemNameSnapshot;
  return 'Unknown';
}

function buildSaveLine(
  line: ProcessReceiptLine,
  invoice: ICapturedInvoice,
  items: { id: string; name: string }[],
  detailCache: Record<string, ICapturedInvoiceWithLines>,
) {
  const computed = getProcessLineComputed(line, invoice.vatMode, invoice.vatRate);
  return {
    id: line.id,
    itemId: line.itemId,
    itemNameSnapshot: itemNameSnapshotOf(line.itemId, invoice.id, items, detailCache),
    quantity: Number(line.quantity) || 0,
    unitPrice: computed.netUnitPrice,
    isVatable: line.isVatable,
    totalVatExclude: computed.netTotal,
  };
}

function buildSaveEditPayload(
  invoice: ICapturedInvoice,
  editLines: ProcessReceiptLine[],
  note: string,
  items: { id: string; name: string }[],
  detailCache: Record<string, ICapturedInvoiceWithLines>,
) {
  return {
    id: invoice.id,
    note: note || undefined,
    vatMode: invoice.vatMode,
    vatRate: invoice.vatRate,
    lines: editLines.map((line) => buildSaveLine(line, invoice, items, detailCache)),
  };
}

function buildSavePostedEditPayload(
  invoice: ICapturedInvoice,
  editLines: ProcessReceiptLine[],
  note: string,
  items: { id: string; name: string }[],
  detailCache: Record<string, ICapturedInvoiceWithLines>,
  invoiceDate: Date | null | undefined,
) {
  return {
    ...buildSaveEditPayload(invoice, editLines, note, items, detailCache),
    invoiceDate,
  };
}

function buildMetadataSavePayload(
  id: string,
  fields: {
    supplierId: string | null;
    invoiceNumber: string;
    invoiceDate: Date | null;
    note: string;
  },
) {
  return {
    id,
    supplierId: fields.supplierId,
    invoiceNumber: fields.invoiceNumber,
    invoiceDate: fields.invoiceDate,
    note: fields.note || undefined,
  };
}

export function useInvoiceSaveHandlers({
  items,
  detailCache,
  setDetailCache,
  loadInvoices,
  setMode,
}: SaveHandlerDeps) {
  const handleSaveEdit = useCallback(
    async (
      invoice: ICapturedInvoice,
      editLines: ProcessReceiptLine[],
      note: string,
      invoiceDate?: Date | null,
    ) => {
      try {
        if (invoice.status === InvoiceStatus.Posted) {
          const payload = buildSavePostedEditPayload(
            invoice,
            editLines,
            note,
            items,
            detailCache,
            invoiceDate,
          );
          await invoiceService.updatePostedInvoiceLines(payload);
        } else {
          const payload = buildSaveEditPayload(invoice, editLines, note, items, detailCache);
          await invoiceService.updateInvoice(payload);
        }
        setDetailCache((prev) => {
          const next = { ...prev };
          delete next[invoice.id];
          return next;
        });
        await loadInvoices();
        setMode(invoice.id, { kind: RowModeKind.View });
        toast.success('Invoice updated');
      } catch (err) {
        toast.error(ipcErrorMessage(err, 'Failed to save the invoice'));
        throw err;
      }
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
      try {
        await invoiceService.updateInvoiceMetadata(buildMetadataSavePayload(id, fields));
        setDetailCache((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        await loadInvoices();
        setMode(id, { kind: RowModeKind.View });
        toast.success('Invoice details updated');
      } catch (err) {
        toast.error(ipcErrorMessage(err, 'Failed to save the invoice details'));
        throw err;
      }
    },
    [setDetailCache, loadInvoices, setMode],
  );

  return {
    handleSaveEdit,
    handleMetadataSave,
  };
}

import { useCallback } from 'react';
import type { ICapturedInvoice, ICapturedInvoiceWithLines } from '@reyogo/types';
import { invoiceService } from '@/services/invoice';
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
    lines: editLines.map((line) => {
      const computed = getProcessLineComputed(line, invoice.vatMode, invoice.vatRate);
      return {
        id: line.id,
        itemId: line.itemId,
        itemNameSnapshot:
          items.find((i) => i.id === line.itemId)?.name ??
          detailCache[invoice.id]?.lines.find((l) => l.itemId === line.itemId)?.itemNameSnapshot ??
          'Unknown',
        quantity: Number(line.quantity) || 0,
        unitPrice: computed.netUnitPrice,
        isVatable: line.isVatable,
        totalVatExclude: computed.netTotal,
      };
    }),
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
    async (invoice: ICapturedInvoice, editLines: ProcessReceiptLine[], note: string) => {
      const payload = buildSaveEditPayload(invoice, editLines, note, items, detailCache);
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
      await invoiceService.updateInvoiceMetadata(buildMetadataSavePayload(id, fields));
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
    handleSaveEdit,
    handleMetadataSave,
  };
}

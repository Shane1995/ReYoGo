import { useMemo } from 'react';
import { InvoiceStatus } from '@reyogo/types';
import type { ICapturedInvoice, ICapturedInvoiceWithLines } from '@reyogo/types';
import { useTableSort } from '@/hooks/useTableSort';
import { invoiceTotals } from '../../../utils/invoiceTotals';

function compareNullable<T>(a: T | null, b: T | null, cmp: (x: T, y: T) => number): number {
  if (a === null) return b === null ? 0 : 1;
  if (b === null) return -1;
  return cmp(a, b);
}

function orNull<T>(value: T | null | undefined): T | null {
  if (value == null) return null;
  return value;
}

function lineCountOf(detail: { lines: unknown[] } | undefined): number | null {
  if (!detail) return null;
  return detail.lines.length;
}

function exclTotalOf(detail: Parameters<typeof invoiceTotals>[0] | undefined): number | null {
  if (!detail) return null;
  return invoiceTotals(detail).excl;
}

const sortByInvoiceNumber = (a: ICapturedInvoice, b: ICapturedInvoice) =>
  a.invoiceNumber.localeCompare(b.invoiceNumber);

const sortByDate = (a: ICapturedInvoice, b: ICapturedInvoice) => {
  const aDate = (a.invoiceDate ?? a.createdAt).getTime();
  const bDate = (b.invoiceDate ?? b.createdAt).getTime();
  return aDate - bDate;
};

const sortByStatus = (a: ICapturedInvoice, b: ICapturedInvoice) => a.status.localeCompare(b.status);

const sortByLastEdited = (a: ICapturedInvoice, b: ICapturedInvoice) =>
  compareNullable(orNull(a.updatedAt), orNull(b.updatedAt), (x, y) => x.getTime() - y.getTime());

export function useSortedInvoiceRows(
  invoices: ICapturedInvoice[],
  selectedEntityId: string,
  detailCache: Record<string, ICapturedInvoiceWithLines | undefined>,
) {
  const visibleInvoices = invoices.filter((inv) => inv.entityId === selectedEntityId);
  const drafts = visibleInvoices.filter((inv) => inv.status === InvoiceStatus.Draft);
  const posted = visibleInvoices.filter((inv) => inv.status !== InvoiceStatus.Draft);

  const compareFns = useMemo(
    () => ({
      invoiceNumber: sortByInvoiceNumber,
      date: sortByDate,
      status: sortByStatus,
      lastEdited: sortByLastEdited,
      lines: (a: ICapturedInvoice, b: ICapturedInvoice) =>
        compareNullable(
          lineCountOf(detailCache[a.id]),
          lineCountOf(detailCache[b.id]),
          (x, y) => x - y,
        ),
      excl: (a: ICapturedInvoice, b: ICapturedInvoice) =>
        compareNullable(
          exclTotalOf(detailCache[a.id]),
          exclTotalOf(detailCache[b.id]),
          (x, y) => x - y,
        ),
    }),
    [detailCache],
  );

  const {
    sortedData: sortedPosted,
    sortKey,
    sortDir,
    toggleSort,
  } = useTableSort(posted, compareFns);

  return { visibleInvoices, drafts, sortedPosted, sortKey, sortDir, toggleSort };
}

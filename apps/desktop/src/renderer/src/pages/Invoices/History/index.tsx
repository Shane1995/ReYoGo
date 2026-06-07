import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button, PageHeader } from '@reyogo/ui';
import { InvoiceStatus } from '@reyogo/types';
import { InvoiceRoutes } from '@/components/AppRoutes/routePaths';
import { useEntities } from '@/Context/EntityContext';
import { ReceiptIcon } from 'lucide-react';
import { useInvoiceHistory } from './hooks/useInvoiceHistory';
import { InvoiceFilterBar } from './components/InvoiceFilterBar';
import { InvoiceHistoryTable } from './components/InvoiceHistoryTable';
import { invoiceTotals } from '../utils/invoiceTotals';
import type { ICapturedInvoice } from '@reyogo/types';
import { useTableSort } from '@/hooks/useTableSort';

const sortByInvoiceNumber = (a: ICapturedInvoice, b: ICapturedInvoice) =>
  a.invoiceNumber.localeCompare(b.invoiceNumber);

const sortByDate = (a: ICapturedInvoice, b: ICapturedInvoice) => {
  const aDate = (a.invoiceDate ?? a.createdAt).getTime();
  const bDate = (b.invoiceDate ?? b.createdAt).getTime();
  return aDate - bDate;
};

const sortByStatus = (a: ICapturedInvoice, b: ICapturedInvoice) => a.status.localeCompare(b.status);

const sortByLastEdited = (a: ICapturedInvoice, b: ICapturedInvoice) => {
  if (!a.updatedAt && !b.updatedAt) return 0;
  if (!a.updatedAt) return 1;
  if (!b.updatedAt) return -1;
  return a.updatedAt.getTime() - b.updatedAt.getTime();
};

export default function InvoiceHistoryPage() {
  const {
    invoices,
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
    conflictModal,
  } = useInvoiceHistory();

  const { selectedEntityId } = useEntities();

  const visibleInvoices = invoices.filter((inv) => inv.entityId === selectedEntityId);
  const drafts = visibleInvoices.filter((inv) => inv.status === InvoiceStatus.Draft);
  const posted = visibleInvoices.filter((inv) => inv.status !== InvoiceStatus.Draft);

  const compareFns = useMemo(
    () => ({
      invoiceNumber: sortByInvoiceNumber,
      date: sortByDate,
      status: sortByStatus,
      lastEdited: sortByLastEdited,
      lines: (a: ICapturedInvoice, b: ICapturedInvoice) => {
        const aLines = detailCache[a.id]?.lines.length ?? null;
        const bLines = detailCache[b.id]?.lines.length ?? null;
        if (aLines == null && bLines == null) return 0;
        if (aLines == null) return 1;
        if (bLines == null) return -1;
        return aLines - bLines;
      },
      excl: (a: ICapturedInvoice, b: ICapturedInvoice) => {
        const aDetail = detailCache[a.id];
        const bDetail = detailCache[b.id];
        if (!aDetail && !bDetail) return 0;
        if (!aDetail) return 1;
        if (!bDetail) return -1;
        return invoiceTotals(aDetail).excl - invoiceTotals(bDetail).excl;
      },
    }),
    [detailCache],
  );

  const {
    sortedData: sortedPosted,
    sortKey,
    sortDir,
    toggleSort,
  } = useTableSort(posted, compareFns);

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <PageHeader
          title="Invoice History"
          description="Past captured invoices. Click a row to expand details, or edit with full audit trail."
          actions={
            <Button asChild size="sm">
              <Link to={InvoiceRoutes.Base} className="inline-flex items-center gap-2">
                <ReceiptIcon className="size-4" aria-hidden />
                Capture new
              </Link>
            </Button>
          }
        >
          <InvoiceFilterBar
            search={search}
            setSearch={setSearch}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            supplierFilter={supplierFilter}
            setSupplierFilter={setSupplierFilter}
            suppliers={suppliers}
            hasFilters={hasFilters}
            clearFilters={clearFilters}
          />
        </PageHeader>

        <InvoiceHistoryTable
          loading={loading}
          invoices={visibleInvoices}
          drafts={drafts}
          sortedPosted={sortedPosted}
          hasFilters={hasFilters}
          sortKey={sortKey}
          sortDir={sortDir}
          toggleSort={toggleSort}
          rowMode={rowMode}
          detailCache={detailCache}
          postingId={postingId}
          suppliers={suppliers}
          onExpand={handleExpandDetail}
          onEditClick={handleEditClick}
          onAuditClick={handleAuditClick}
          onPost={handlePost}
          onReuse={handleReuse}
          onRaiseCreditNoteClick={handleRaiseCreditNoteClick}
          onSaveEdit={handleSaveEdit}
          onMetadataSave={handleMetadataSave}
          onSaveCreditNote={handleSaveCreditNote}
          onSetMode={setMode}
        />
      </div>
      {conflictModal}
    </>
  );
}

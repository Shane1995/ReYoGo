import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button, PageHeader } from '@reyogo/ui';
import { InvoiceStatus } from '@reyogo/types';
import { InvoiceRoutes } from '@/components/AppRoutes/routePaths';
import { useEntities } from '@/Context/EntityContext';
import { ReceiptIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { useInvoiceHistory } from './hooks/useInvoiceHistory';
import { InvoiceRow } from './components/InvoiceRow';
import { InvoiceFilterBar } from './components/InvoiceFilterBar';
import { SortableHead } from './components/SortableHead';
import { invoiceTotals } from '../utils/invoiceTotals';
import type { ICapturedInvoice } from '@reyogo/types';
import { useTableSort } from '@/hooks/useTableSort';

const COLUMN_COUNT = 10;

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

  const rowProps = {
    detailCache,
    postingId,
    suppliers,
    onExpand: handleExpandDetail,
    onEditClick: handleEditClick,
    onAuditClick: handleAuditClick,
    onPost: handlePost,
    onReuse: handleReuse,
    onRaiseCreditNoteClick: handleRaiseCreditNoteClick,
    onSaveEdit: handleSaveEdit,
    onMetadataSave: handleMetadataSave,
    onSaveCreditNote: handleSaveCreditNote,
    onSetMode: setMode,
  };

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

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : visibleInvoices.length === 0 ? (
            <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
              {hasFilters ? (
                <p>No invoices match the current filters.</p>
              ) : (
                <>
                  <p>No captured invoices yet.</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link to={InvoiceRoutes.Base}>Capture your first invoice</Link>
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-8 p-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70" />
                    <SortableHead
                      sortKey="invoiceNumber"
                      label="Invoice #"
                      activeKey={sortKey}
                      activeDir={sortDir}
                      onToggle={toggleSort}
                    />
                    <SortableHead
                      sortKey="date"
                      label="Date"
                      activeKey={sortKey}
                      activeDir={sortDir}
                      onToggle={toggleSort}
                    />
                    <SortableHead
                      sortKey="lines"
                      label="Lines"
                      activeKey={sortKey}
                      activeDir={sortDir}
                      onToggle={toggleSort}
                      className="w-14"
                    />
                    <SortableHead
                      sortKey="excl"
                      label="Excl."
                      activeKey={sortKey}
                      activeDir={sortDir}
                      onToggle={toggleSort}
                      className="w-28"
                    />
                    <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 w-24 text-right">
                      VAT
                    </TableHead>
                    <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 w-28 text-right">
                      Total
                    </TableHead>
                    <SortableHead
                      sortKey="status"
                      label="Status"
                      activeKey={sortKey}
                      activeDir={sortDir}
                      onToggle={toggleSort}
                      className="w-24"
                    />
                    <SortableHead
                      sortKey="lastEdited"
                      label="Last edited"
                      activeKey={sortKey}
                      activeDir={sortDir}
                      onToggle={toggleSort}
                      className="w-36"
                    />
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drafts.length > 0 && (
                    <TableRow className="hover:bg-transparent border-none h-7">
                      <TableCell
                        colSpan={COLUMN_COUNT}
                        className="py-1.5 px-3 border-l-[2.5px] border-l-amber-500 bg-amber-100 dark:bg-amber-900/40"
                      >
                        <div className="flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-amber-600 inline-block animate-pulse" />
                          <span className="text-[10px] uppercase tracking-[0.14em] text-amber-900 dark:text-amber-200 font-semibold">
                            {drafts.length} draft{drafts.length !== 1 ? 's' : ''} pending review
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {drafts.map((inv, i) => (
                    <InvoiceRow
                      key={inv.id}
                      inv={inv}
                      rowIndex={i}
                      mode={rowMode[inv.id]}
                      detail={detailCache[inv.id]}
                      {...rowProps}
                    />
                  ))}

                  {drafts.length > 0 && posted.length > 0 && (
                    <TableRow className="hover:bg-transparent h-px">
                      <TableCell colSpan={COLUMN_COUNT} className="p-0 bg-border/40" />
                    </TableRow>
                  )}

                  {sortedPosted.map((inv, i) => (
                    <InvoiceRow
                      key={inv.id}
                      inv={inv}
                      rowIndex={i}
                      mode={rowMode[inv.id]}
                      detail={detailCache[inv.id]}
                      {...rowProps}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
      {conflictModal}
    </>
  );
}

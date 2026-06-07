import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button, PageHeader, DateRangePicker, cn } from '@reyogo/ui';
import { InvoiceStatus } from '@reyogo/types';
import { InvoiceRoutes } from '@/components/AppRoutes/routePaths';
import { useEntities } from '@/Context/EntityContext';
import { ReceiptIcon, SearchIcon, XIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { useInvoiceHistory } from './hooks/useInvoiceHistory';
import { InvoiceRow } from './components/InvoiceRow';
import { invoiceTotals } from '../utils/invoiceTotals';
import type { ICapturedInvoice } from '@reyogo/types';
import { useTableSort } from '@/hooks/useTableSort';
import { SortIndicator } from '@/components/DataTable/SortIndicator';

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

const fieldLabel =
  'text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 mb-1 block';
const selectBase =
  'h-8 rounded-md border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 pr-7';

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

  const renderSortHead = (key: string, label: string, className?: string) => {
    const isActive = sortKey === key;
    return (
      <TableHead
        className={cn(
          'text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70',
          className,
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          className="-mx-2 h-auto py-0 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 hover:text-foreground hover:bg-transparent gap-0"
          onClick={() => toggleSort(key)}
        >
          {label}
          <SortIndicator active={isActive} dir={isActive ? sortDir : null} />
        </Button>
      </TableHead>
    );
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
          <div className="space-y-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/40 pointer-events-none" />
              <input
                type="search"
                placeholder="Search by item name or invoice number…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  'h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm',
                  'font-[family-name:var(--font-mono,_DM_Mono,_monospace)] placeholder:font-sans placeholder:text-muted-foreground/40',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 transition-shadow',
                  search && 'border-[var(--primary)]/40',
                )}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-end gap-x-4 gap-y-2.5">
              {suppliers.length > 0 && (
                <div className="flex flex-col">
                  <label className={fieldLabel}>Supplier</label>
                  <select
                    value={supplierFilter}
                    onChange={(e) => setSupplierFilter(e.target.value)}
                    className={cn(
                      selectBase,
                      'w-44',
                      !supplierFilter && 'text-muted-foreground/60',
                    )}
                  >
                    <option value="">All suppliers</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="h-6 w-px bg-border/60 self-end mb-1 hidden sm:block" />

              <div className="flex flex-col">
                <label className={fieldLabel}>Date range</label>
                <DateRangePicker
                  from={fromDate}
                  to={toDate}
                  onChange={(f, t) => {
                    setFromDate(f);
                    setToDate(t);
                  }}
                />
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 self-end mb-0.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50 hover:text-foreground transition-colors"
                >
                  <XIcon className="size-3" />
                  Clear all
                </button>
              )}
            </div>
          </div>
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
                    {renderSortHead('invoiceNumber', 'Invoice #')}
                    {renderSortHead('date', 'Date')}
                    {renderSortHead('lines', 'Lines', 'w-14')}
                    {renderSortHead('excl', 'Excl.', 'w-28')}
                    <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 w-24 text-right">
                      VAT
                    </TableHead>
                    <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 w-28 text-right">
                      Total
                    </TableHead>
                    {renderSortHead('status', 'Status', 'w-24')}
                    {renderSortHead('lastEdited', 'Last edited', 'w-36')}
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
                      postingId={postingId}
                      suppliers={suppliers}
                      detailCache={detailCache}
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
                      postingId={postingId}
                      suppliers={suppliers}
                      detailCache={detailCache}
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

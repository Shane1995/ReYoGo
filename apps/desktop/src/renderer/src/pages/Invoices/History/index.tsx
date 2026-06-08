import { useMemo, type ComponentProps } from 'react';
import { Link } from 'react-router-dom';
import { Button, PageHeader } from '@reyogo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { InvoiceStatus } from '@reyogo/types';
import { InvoiceRoutes } from '@/components/AppRoutes/routePaths';
import { useEntities } from '@/Context/EntityContext';
import { ReceiptIcon } from 'lucide-react';
import { useInvoiceHistory } from './hooks/useInvoiceHistory';
import { InvoiceFilterBar } from './components/InvoiceFilterBar';
import { InvoiceRow } from './components/InvoiceRow';
import { SortableHead } from './components/SortableHead';
import { invoiceTotals } from '../utils/invoiceTotals';
import type { ICapturedInvoice, ICapturedInvoiceWithLines } from '@reyogo/types';
import { useTableSort, type SortDir } from '@/hooks/useTableSort';
import { type RowMode } from './types';

const COLUMN_COUNT = 10;

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

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  if (hasFilters) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
        <p>No invoices match the current filters.</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
      <p>No captured invoices yet.</p>
      <Button asChild variant="link" className="mt-2">
        <Link to={InvoiceRoutes.Base}>Capture your first invoice</Link>
      </Button>
    </div>
  );
}

function DraftBanner({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <TableRow className="hover:bg-transparent border-none h-7">
      <TableCell
        colSpan={COLUMN_COUNT}
        className="py-1.5 px-3 border-l-[2.5px] border-l-amber-500 bg-amber-100 dark:bg-amber-900/40"
      >
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-amber-600 inline-block animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.14em] text-amber-900 dark:text-amber-200 font-semibold">
            {count} draft{count !== 1 ? 's' : ''} pending review
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}

function DraftDivider({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <TableRow className="hover:bg-transparent h-px">
      <TableCell colSpan={COLUMN_COUNT} className="p-0 bg-border/40" />
    </TableRow>
  );
}

type RowProps = Omit<ComponentProps<typeof InvoiceRow>, 'inv' | 'rowIndex' | 'mode' | 'detail'>;

type InvoiceTableProps = {
  drafts: ICapturedInvoice[];
  sortedPosted: ICapturedInvoice[];
  sortKey: string | null;
  sortDir: SortDir;
  toggleSort: (key: string) => void;
  rowMode: Record<string, RowMode>;
  detailCache: Record<string, ICapturedInvoiceWithLines | undefined>;
  rowProps: RowProps;
};

function InvoiceTable({
  drafts,
  sortedPosted,
  sortKey,
  sortDir,
  toggleSort,
  rowMode,
  detailCache,
  rowProps,
}: InvoiceTableProps) {
  return (
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
          <DraftBanner count={drafts.length} />
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
          <DraftDivider show={drafts.length > 0 && sortedPosted.length > 0} />
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
  );
}

type HistoryBodyProps = InvoiceTableProps & {
  loading: boolean;
  visibleInvoices: ICapturedInvoice[];
  hasFilters: boolean;
};

function HistoryBody({ loading, visibleInvoices, hasFilters, ...tableProps }: HistoryBodyProps) {
  if (loading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (visibleInvoices.length === 0) return <EmptyState hasFilters={hasFilters} />;
  return <InvoiceTable {...tableProps} />;
}

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
          <HistoryBody
            loading={loading}
            visibleInvoices={visibleInvoices}
            hasFilters={hasFilters}
            drafts={drafts}
            sortedPosted={sortedPosted}
            sortKey={sortKey}
            sortDir={sortDir}
            toggleSort={toggleSort}
            rowMode={rowMode}
            detailCache={detailCache}
            rowProps={rowProps}
          />
        </div>
      </div>
      {conflictModal}
    </>
  );
}

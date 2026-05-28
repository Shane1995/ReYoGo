import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Button, PageHeader, DateRangePicker, cn } from '@reyogo/ui';
import { InvoiceRoutes } from '@/components/AppRoutes/routePaths';
import {
  ReceiptIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon,
  ClockIcon,
  CopyIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { EditPanel } from './components/EditPanel';
import { AuditPanel } from './components/AuditPanel';
import { useInvoiceHistory } from './hooks/useInvoiceHistory';
import { formatDate } from '../utils/formatDate';
import { formatMoney } from '../utils/formatMoney';
import { invoiceTotals } from '../utils/invoiceTotals';

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
  } = useInvoiceHistory();

  return (
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
          {/* Search — long, prominent */}
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

          {/* Filters row */}
          <div className="flex flex-wrap items-end gap-x-4 gap-y-2.5">
            {suppliers.length > 0 && (
              <div className="flex flex-col">
                <label className={fieldLabel}>Supplier</label>
                <select
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  className={cn(selectBase, 'w-44', !supplierFilter && 'text-muted-foreground/60')}
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
        ) : invoices.length === 0 ? (
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
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-8 p-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70" />
                  <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
                    Date
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 w-16 text-right">
                    Lines
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 w-28 text-right">
                    Excl.
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 w-24 text-right">
                    VAT
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 w-28 text-right">
                    Total
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 w-36">
                    Last edited
                  </TableHead>
                  <TableHead className="w-36" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => {
                  const mode = rowMode[inv.id]?.kind ?? 'view';
                  const detail = detailCache[inv.id];
                  const totals = detail ? invoiceTotals(detail) : null;
                  const isExpanded = mode === 'detail' || mode === 'edit' || mode === 'audit';

                  return (
                    <Fragment key={inv.id}>
                      <TableRow
                        className={cn(
                          'cursor-pointer group transition-colors hover:bg-muted/20',
                          isExpanded && 'bg-muted/20',
                        )}
                        onClick={() => handleExpandDetail(inv.id)}
                      >
                        <TableCell className="w-8 p-2 align-middle">
                          {isExpanded ? (
                            <ChevronDownIcon className="size-3.5 text-[var(--nav-active-border)]" />
                          ) : (
                            <ChevronRightIcon className="size-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <span className="text-sm">
                            {inv.invoiceDate
                              ? formatDate(inv.invoiceDate)
                              : formatDate(inv.createdAt)}
                          </span>
                          {inv.invoiceNumber && (
                            <p className="text-[11px] font-mono text-muted-foreground/60 mt-0.5">
                              {inv.invoiceNumber}
                            </p>
                          )}
                          {inv.supplierId && suppliers.length > 0 && (
                            <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                              {suppliers.find((s) => s.id === inv.supplierId)?.name}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                          {detail ? detail.lines.length : '—'}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm tabular-nums">
                          {totals ? formatMoney(totals.excl) : '—'}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm tabular-nums text-muted-foreground">
                          {totals ? formatMoney(totals.vat) : '—'}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm tabular-nums font-semibold">
                          {totals ? formatMoney(totals.total) : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground/60">
                          {inv.updatedAt ? (
                            formatDate(inv.updatedAt)
                          ) : (
                            <span className="opacity-40 italic">Never</span>
                          )}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                              title="Pre-fill capture form with these items"
                              onClick={() => handleReuse(inv.id)}
                            >
                              <CopyIcon className="size-3" />
                              Reuse
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1"
                              onClick={() => handleEditClick(inv.id)}
                            >
                              <PencilIcon className="size-3" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                              onClick={() => handleAuditClick(inv.id)}
                            >
                              <ClockIcon className="size-3" />
                              Audit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {mode === 'detail' && detail && (
                        <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
                          <TableCell colSpan={8} className="p-0">
                            <div className="border-t border-[var(--nav-border)] bg-[var(--nav-accent)]/30 px-6 py-4">
                              {detail.lines.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No line items.</p>
                              ) : (
                                <>
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-[var(--nav-border)]">
                                        <th className="pb-2 pr-4 text-left text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                                          Item
                                        </th>
                                        <th className="pb-2 pr-4 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                                          Qty
                                        </th>
                                        <th className="pb-2 pr-4 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                                          Unit
                                        </th>
                                        <th className="pb-2 pr-4 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                                          Unit price
                                        </th>
                                        <th className="pb-2 pr-4 text-center text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                                          VAT
                                        </th>
                                        <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                                          Line total
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {detail.lines.map((line) => {
                                        const qty = line.quantity || 0;
                                        const unitPrice = qty > 0 ? line.totalVatExclude / qty : 0;
                                        return (
                                          <tr
                                            key={line.id}
                                            className="border-b border-[var(--nav-border)]/50"
                                          >
                                            <td className="py-1.5 pr-4">{line.itemNameSnapshot}</td>
                                            <td className="py-1.5 pr-4 text-right font-mono tabular-nums">
                                              {line.quantity}
                                            </td>
                                            <td className="py-1.5 pr-4 text-right text-muted-foreground/60">
                                              {line.unitOfMeasure ?? '—'}
                                            </td>
                                            <td className="py-1.5 pr-4 text-right font-mono tabular-nums">
                                              {formatMoney(unitPrice)}
                                            </td>
                                            <td className="py-1.5 pr-4 text-center">
                                              {line.isVatable ? (
                                                <span className="text-[var(--nav-active-border)]">
                                                  ✓
                                                </span>
                                              ) : (
                                                <span className="text-muted-foreground/30">—</span>
                                              )}
                                            </td>
                                            <td className="py-1.5 text-right font-mono tabular-nums font-medium">
                                              {formatMoney(line.totalVatExclude)}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                  {(() => {
                                    const t = invoiceTotals(detail);
                                    return (
                                      <div className="mt-3 flex gap-6 text-sm border-t border-[var(--nav-border)] pt-3">
                                        <span className="text-muted-foreground/60 text-[11px] uppercase tracking-widest font-medium">
                                          Excl.{' '}
                                          <span className="font-mono font-semibold text-foreground text-sm normal-case tracking-normal">
                                            {formatMoney(t.excl)}
                                          </span>
                                        </span>
                                        <span className="text-muted-foreground/60 text-[11px] uppercase tracking-widest font-medium">
                                          VAT{' '}
                                          <span className="font-mono font-semibold text-foreground text-sm normal-case tracking-normal">
                                            {formatMoney(t.vat)}
                                          </span>
                                        </span>
                                        <span className="text-muted-foreground/60 text-[11px] uppercase tracking-widest font-medium">
                                          Total{' '}
                                          <span className="font-mono font-bold text-foreground text-sm normal-case tracking-normal">
                                            {formatMoney(t.total)}
                                          </span>
                                        </span>
                                        <span className="text-muted-foreground/60 text-[11px] uppercase tracking-widest font-medium">
                                          Mode{' '}
                                          <span className="font-medium text-foreground text-sm normal-case tracking-normal">
                                            {detail.vatMode === 'inclusive' ? 'Incl.' : 'Excl.'} ·{' '}
                                            {detail.vatRate}%
                                          </span>
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}

                      {mode === 'edit' && detail && (
                        <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
                          <TableCell colSpan={8} className="p-0">
                            <EditPanel
                              invoice={detail}
                              onSave={(lines, note) => handleSaveEdit(inv, lines, note)}
                              onCancel={() => setMode(inv.id, { kind: 'view' })}
                            />
                          </TableCell>
                        </TableRow>
                      )}

                      {mode === 'audit' && (
                        <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
                          <TableCell colSpan={8} className="p-0">
                            <AuditPanel
                              invoiceId={inv.id}
                              onClose={() => setMode(inv.id, { kind: 'view' })}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InvoiceRoutes } from "@/components/AppRoutes/routePaths";
import { ReceiptIcon, ChevronDownIcon, ChevronRightIcon, PencilIcon, ClockIcon, CopyIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EditPanel } from "./EditPanel";
import { AuditPanel } from "./AuditPanel";
import { useInvoiceHistory } from "./hooks/useInvoiceHistory";
import { formatDate } from "../utils/formatDate";
import { formatMoney } from "../utils/formatMoney";
import { invoiceTotals } from "../utils/invoiceTotals";

export default function InvoiceHistoryPage() {
  const {
    invoices,
    loading,
    detailCache,
    rowMode,
    setMode,
    search,
    setSearch,
    handleReuse,
    handleExpandDetail,
    handleEditClick,
    handleAuditClick,
    handleSaveEdit,
  } = useInvoiceHistory();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-border bg-background px-4 py-3 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Invoice history</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Past captured invoices (goods received). Click a row to expand details, or edit with full audit trail.
            </p>
          </div>
          <Button asChild size="sm">
            <Link to={InvoiceRoutes.Base} className="inline-flex items-center gap-2">
              <ReceiptIcon className="size-4" aria-hidden />
              Capture new invoice
            </Link>
          </Button>
        </div>
        <input
          type="search"
          placeholder="Search by item name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : invoices.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
            {search ? (
              <p>No invoices contain an item matching <strong>"{search}"</strong>.</p>
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
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary hover:bg-secondary">
                  <TableHead className="w-8 p-2 text-xs font-semibold uppercase tracking-wider text-foreground/80" />
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-foreground/80">Date captured</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-foreground/80 w-16 text-right">Lines</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-foreground/80 w-28 text-right">Excl.</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-foreground/80 w-24 text-right">VAT</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-foreground/80 w-28 text-right">Total</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-foreground/80 w-36">Last edited</TableHead>
                  <TableHead className="w-36" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv, i) => {
                  const mode = rowMode[inv.id]?.kind ?? "view";
                  const detail = detailCache[inv.id];
                  const totals = detail ? invoiceTotals(detail.lines) : null;

                  return (
                    <Fragment key={inv.id}>
                      <TableRow
                        className={cn(
                          "cursor-pointer hover:bg-muted/30",
                          i % 2 === 1 && "bg-white/[0.06]",
                          (mode === "detail" || mode === "edit" || mode === "audit") && "bg-muted/20"
                        )}
                        onClick={() => handleExpandDetail(inv.id)}
                      >
                        <TableCell className="w-8 p-2 align-middle">
                          {mode === "detail" || mode === "edit" || mode === "audit" ? (
                            <ChevronDownIcon className="size-4 text-muted-foreground" />
                          ) : (
                            <ChevronRightIcon className="size-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatDate(inv.createdAt)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {detail ? detail.lines.length : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {totals ? formatMoney(totals.excl) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm text-muted-foreground">
                          {totals ? formatMoney(totals.vat) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {totals ? formatMoney(totals.total) : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {inv.updatedAt ? formatDate(inv.updatedAt) : <span className="italic opacity-50">Never</span>}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1 justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1 text-muted-foreground"
                              title="Pre-fill capture form with these items (no qty or price)"
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
                              className="h-7 px-2 text-xs gap-1 text-muted-foreground"
                              onClick={() => handleAuditClick(inv.id)}
                            >
                              <ClockIcon className="size-3" />
                              Audit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {mode === "detail" && detail && (
                        <TableRow className="border-border hover:bg-transparent">
                          <TableCell colSpan={8} className="p-0">
                            <div className="border-t border-border bg-muted/10 px-4 py-3">
                              {detail.lines.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No line items.</p>
                              ) : (
                                <>
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-border">
                                        <th className="pb-2 pr-4 text-left font-medium">Item</th>
                                        <th className="pb-2 pr-4 text-right font-medium">Qty</th>
                                        <th className="pb-2 pr-4 text-right font-medium">UoM</th>
                                        <th className="pb-2 pr-4 text-right font-medium">Unit price</th>
                                        <th className="pb-2 pr-4 text-right font-medium">VAT</th>
                                        <th className="pb-2 text-right font-medium">Line total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {detail.lines.map((line) => {
                                        const qty = line.quantity || 0;
                                        const unitPrice = qty > 0 ? line.totalVatExclude / qty : 0;
                                        return (
                                          <tr key={line.id} className="border-b border-border/50">
                                            <td className="py-1.5 pr-4">{line.itemNameSnapshot}</td>
                                            <td className="py-1.5 pr-4 text-right">{line.quantity}</td>
                                            <td className="py-1.5 pr-4 text-right text-muted-foreground">
                                              {line.unitOfMeasure ?? "—"}
                                            </td>
                                            <td className="py-1.5 pr-4 text-right font-mono">
                                              {formatMoney(unitPrice)}
                                            </td>
                                            <td className="py-1.5 pr-4 text-right">
                                              {line.vatMode === "non-taxable" ? "—" : `${line.vatRate}%`}
                                            </td>
                                            <td className="py-1.5 text-right font-mono">
                                              {formatMoney(line.totalVatExclude)}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                  {(() => {
                                    const t = invoiceTotals(detail.lines);
                                    return (
                                      <div className="mt-3 flex gap-6 text-sm border-t border-border pt-3">
                                        <span className="text-muted-foreground">Exclusive <span className="font-mono font-medium text-foreground">{formatMoney(t.excl)}</span></span>
                                        <span className="text-muted-foreground">VAT <span className="font-mono font-medium text-foreground">{formatMoney(t.vat)}</span></span>
                                        <span className="text-muted-foreground">Total <span className="font-mono font-semibold text-foreground">{formatMoney(t.total)}</span></span>
                                      </div>
                                    );
                                  })()}
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}

                      {mode === "edit" && detail && (
                        <TableRow className="border-border hover:bg-transparent">
                          <TableCell colSpan={8} className="p-0">
                            <EditPanel
                              invoice={detail}
                              onSave={(lines, note) => handleSaveEdit(inv, lines, note)}
                              onCancel={() => setMode(inv.id, { kind: "view" })}
                            />
                          </TableCell>
                        </TableRow>
                      )}

                      {mode === "audit" && (
                        <TableRow className="border-border hover:bg-transparent">
                          <TableCell colSpan={8} className="p-0">
                            <AuditPanel
                              invoiceId={inv.id}
                              onClose={() => setMode(inv.id, { kind: "view" })}
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

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { InvoicesIPC } from "@shared/types/ipc";
import type { ICapturedInvoice, ICapturedInvoiceWithLines } from "@shared/types/contract";
import { Button } from "@/components/ui/button";
import { InvoiceRoutes } from "@/components/AppRoutes/routePaths";
import { ReceiptIcon } from "lucide-react";

function formatDate(d: Date): string {
  return new Date(d).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatMoney(n: number): string {
  return n.toFixed(2);
}

export default function InvoiceHistoryPage() {
  const [invoices, setInvoices] = useState<ICapturedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ICapturedInvoiceWithLines | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await window.electronAPI.ipcRenderer.invoke(InvoicesIPC.GET_INVOICES);
        if (!cancelled) setInvoices(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const inv = await window.electronAPI.ipcRenderer.invoke(InvoicesIPC.GET_INVOICE, selectedId);
        if (!cancelled) setDetail(inv ?? null);
      } catch {
        if (!cancelled) setDetail(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-[var(--nav-border)] bg-background px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Invoice history</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Past captured invoices (goods received). Save new ones from Capture Invoice.
            </p>
          </div>
          <Button asChild size="sm">
            <Link to={InvoiceRoutes.Base} className="inline-flex items-center gap-2">
              <ReceiptIcon className="size-4" aria-hidden />
              Capture new invoice
            </Link>
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : invoices.length === 0 ? (
          <div className="rounded-lg border border-[var(--nav-border)] bg-muted/20 p-8 text-center text-muted-foreground">
            <p>No captured invoices yet.</p>
            <Button asChild variant="link" className="mt-2">
              <Link to={InvoiceRoutes.Base}>Capture your first invoice</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="rounded-lg border border-[var(--nav-border)] bg-background overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(selectedId === inv.id ? null : inv.id)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-muted/30"
                >
                  <span className="font-medium text-foreground">
                    Invoice · {formatDate(inv.createdAt)}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {selectedId === inv.id ? "Hide details" : "Show details"}
                  </span>
                </button>
                {selectedId === inv.id && detail?.id === inv.id && (
                  <div className="border-t border-[var(--nav-border)] bg-muted/10 px-4 py-3">
                    {detail.lines.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No line items.</p>
                    ) : (
                      <>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[var(--nav-border)]">
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
                                <tr key={line.id} className="border-b border-[var(--nav-border)]/50">
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
                          const totalExclusive = detail.lines.reduce((s, l) => s + l.totalVatExclude, 0);
                          const totalVat = detail.lines.reduce(
                            (s, l) =>
                              s +
                              (l.vatMode !== "non-taxable"
                                ? l.totalVatExclude * (l.vatRate / 100)
                                : 0),
                            0
                          );
                          const total = totalExclusive + totalVat;
                          return (
                            <div className="mt-3 flex flex-wrap items-center gap-6 border-t border-[var(--nav-border)] pt-3 text-sm">
                              <span className="text-muted-foreground">
                                Exclusive <span className="font-mono font-medium text-foreground">{formatMoney(totalExclusive)}</span>
                              </span>
                              <span className="text-muted-foreground">
                                VAT <span className="font-mono font-medium text-foreground">{formatMoney(totalVat)}</span>
                              </span>
                              <span className="text-muted-foreground">
                                Total <span className="font-mono font-semibold text-foreground">{formatMoney(total)}</span>
                              </span>
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { XIcon, ClockIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { InvoicesIPC } from "@shared/types/ipc";
import type { ICapturedInvoiceAuditEntry } from "@shared/types/contract";
import { formatDate } from "../../utils/formatDate";
import { formatMoney } from "../../utils/formatMoney";
import { invoiceTotals } from "../../utils/invoiceTotals";

type Props = {
  invoiceId: string;
  onClose: () => void;
};

export function AuditPanel({ invoiceId, onClose }: Props) {
  const [entries, setEntries] = useState<ICapturedInvoiceAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await window.electronAPI.ipcRenderer.invoke(
          InvoicesIPC.GET_INVOICE_AUDIT,
          invoiceId
        );
        if (!cancelled) setEntries(result);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [invoiceId]);

  return (
    <div className="border-t border-[var(--nav-border)] bg-muted/5">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--nav-border)]/60">
        <span className="text-sm font-medium flex items-center gap-1.5">
          <ClockIcon className="size-3.5 text-muted-foreground" />
          Edit history
        </span>
        <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <XIcon className="size-4" />
        </button>
      </div>

      <div className="px-4 py-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No edits recorded for this invoice.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((entry) => {
              const snap = entry.snapshot;
              const totals = invoiceTotals(snap.lines);
              const isOpen = expanded === entry.id;
              return (
                <div key={entry.id} className="rounded-md border border-[var(--nav-border)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : entry.id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/30"
                  >
                    {isOpen ? (
                      <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <span className="font-medium">{formatDate(entry.editedAt)}</span>
                    {entry.note && (
                      <span className="text-muted-foreground truncate">— {entry.note}</span>
                    )}
                    <span className="ml-auto shrink-0 font-mono text-muted-foreground">
                      {snap.lines.length} line{snap.lines.length !== 1 ? "s" : ""} · {formatMoney(totals.total)}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-[var(--nav-border)]/60 bg-muted/10 px-3 py-2">
                      <p className="mb-1.5 text-xs text-muted-foreground">Snapshot before this edit:</p>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-[var(--nav-border)]/50">
                            <th className="pb-1 pr-3 text-left font-medium">Item</th>
                            <th className="pb-1 pr-3 text-right font-medium">Qty</th>
                            <th className="pb-1 pr-3 text-right font-medium">Total excl.</th>
                            <th className="pb-1 text-right font-medium">VAT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {snap.lines.map((l) => (
                            <tr key={l.id} className="border-b border-[var(--nav-border)]/30">
                              <td className="py-1 pr-3">{l.itemNameSnapshot}</td>
                              <td className="py-1 pr-3 text-right">{l.quantity}</td>
                              <td className="py-1 pr-3 text-right font-mono">{formatMoney(l.totalVatExclude)}</td>
                              <td className="py-1 text-right">
                                {l.vatMode === "non-taxable" ? "—" : `${l.vatRate}%`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                        <span>Excl. <span className="font-mono text-foreground">{formatMoney(totals.excl)}</span></span>
                        <span>VAT <span className="font-mono text-foreground">{formatMoney(totals.vat)}</span></span>
                        <span>Total <span className="font-mono font-semibold text-foreground">{formatMoney(totals.total)}</span></span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

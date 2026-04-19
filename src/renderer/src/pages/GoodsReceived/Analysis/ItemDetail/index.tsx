import { useState } from "react";
import { cn } from "@/lib/utils";
import { ItemDetailChart } from "../ItemDetailChart";
import { fmt, fmtDate, fmtPct } from "../utils/format";
import { overallChangePct } from "../utils/stats";
import { segBtn, changeCls } from "../utils/styles";
import type { ItemGroup, Metric } from "../types";

export function ItemDetail({ group, onBack }: { group: ItemGroup; onBack: () => void }) {
  const [metric, setMetric] = useState<Metric>("price");

  const last = group.entries[group.entries.length - 1];
  const first = group.entries[0];
  const change = overallChangePct(group);
  const minPrice = Math.min(...group.entries.map((e) => e.unitPrice));
  const maxPrice = Math.max(...group.entries.map((e) => e.unitPrice));
  const avgPrice = group.entries.reduce((s, e) => s + e.unitPrice, 0) / group.entries.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>←</span>
          <span>All items</span>
        </button>
        <span className="text-muted-foreground/40">/</span>
        <h2 className="text-sm font-semibold text-foreground">{group.name}</h2>
        {group.uom && <span className="text-xs text-muted-foreground">({group.uom})</span>}
        {change !== null && (
          <span className={cn(
            "ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono",
            change > 0 ? "bg-destructive/10 text-destructive"
            : change < 0 ? "bg-green-600/10 text-green-600 dark:text-green-500"
            : "bg-muted text-muted-foreground"
          )}>
            {fmtPct(change)} overall
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {[
          { label: "First capture", value: fmtDate(first.date), mono: false },
          { label: "Last capture", value: fmtDate(last.date), mono: false },
          { label: "Min price", value: fmt(minPrice) + (group.uom ? ` / ${group.uom}` : ""), mono: true },
          { label: "Avg price", value: fmt(avgPrice) + (group.uom ? ` / ${group.uom}` : ""), mono: true },
          { label: "Max price", value: fmt(maxPrice) + (group.uom ? ` / ${group.uom}` : ""), mono: true },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-[var(--nav-border)] bg-background px-3 py-2.5">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("mt-1 text-sm font-medium text-foreground", s.mono && "font-mono")}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-[var(--nav-border)] bg-background p-0.5 w-fit">
          <button type="button" onClick={() => setMetric("price")} className={segBtn(metric === "price")}>Unit price</button>
          <button type="button" onClick={() => setMetric("change")} className={segBtn(metric === "change")}>% from first</button>
        </div>
        <span className="text-xs text-muted-foreground">{group.entries.length} capture{group.entries.length !== 1 ? "s" : ""}</span>
      </div>

      {group.entries.length < 2 ? (
        <div className="rounded-lg border border-[var(--nav-border)] bg-muted/20 p-6 text-center text-sm text-muted-foreground">
          Only one capture — no trend to chart yet.
        </div>
      ) : (
        <ItemDetailChart group={group} metric={metric} />
      )}

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Capture history</h3>
        <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--nav-border)] bg-muted/30">
                <th className="py-2 px-4 text-left font-medium text-foreground">Date</th>
                <th className="py-2 px-4 text-right font-medium text-foreground">Qty</th>
                <th className="py-2 px-4 text-right font-medium text-foreground">UoM</th>
                <th className="py-2 px-4 text-right font-medium text-foreground">Unit price (excl. VAT)</th>
                <th className="py-2 px-4 text-right font-medium text-foreground">vs Previous</th>
                <th className="py-2 px-4 text-right font-medium text-foreground">vs First</th>
              </tr>
            </thead>
            <tbody>
              {group.entries.map((entry, ei) => {
                const prev = ei > 0 ? group.entries[ei - 1] : null;
                const pct = prev && prev.unitPrice > 0
                  ? ((entry.unitPrice - prev.unitPrice) / prev.unitPrice) * 100 : null;
                const pctFirst = ei > 0 && group.entries[0].unitPrice > 0
                  ? ((entry.unitPrice - group.entries[0].unitPrice) / group.entries[0].unitPrice) * 100 : null;
                return (
                  <tr
                    key={`${entry.invoiceId}-${ei}`}
                    className={cn(
                      "border-b border-[var(--nav-border)]/50",
                      ei % 2 === 0 ? "bg-background" : "bg-muted/10"
                    )}
                  >
                    <td className="py-2 px-4 text-foreground">{fmtDate(entry.date)}</td>
                    <td className="py-2 px-4 text-right font-mono">{entry.quantity}</td>
                    <td className="py-2 px-4 text-right text-muted-foreground">{entry.uom ?? "—"}</td>
                    <td className="py-2 px-4 text-right font-mono font-semibold text-foreground">{fmt(entry.unitPrice)}</td>
                    <td className={cn("py-2 px-4 text-right", changeCls(pct))}>
                      {pct === null ? "—" : fmtPct(pct)}
                    </td>
                    <td className={cn("py-2 px-4 text-right", changeCls(pctFirst))}>
                      {pctFirst === null ? "—" : fmtPct(pctFirst)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmt, fmtDate, fmtPct } from "../utils/format";
import { overallChangePct } from "../utils/stats";
import { changeCls } from "../utils/styles";
import { itemTrendPath } from "@/components/AppRoutes/routePaths";
import type { ItemGroup } from "../types";

export function TableView({ groups }: { groups: ItemGroup[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
        No data for the selected range or search.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary hover:bg-secondary">
            <TableHead className="w-10 text-xs font-semibold uppercase tracking-wider text-foreground/80" />
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-foreground/80">Item</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-foreground/80">Last Captured</TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-foreground/80">Last Unit Price (excl. VAT)</TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-foreground/80">Overall Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group, gi) => {
            const last = group.entries[group.entries.length - 1];
            const change = overallChangePct(group);
            const isExpanded = expanded.has(group.itemId);
            return (
              <Fragment key={group.itemId}>
                <TableRow className={gi % 2 === 1 ? "bg-white/[0.06]" : ""}>
                  <TableCell
                    className="w-10 cursor-pointer text-center text-muted-foreground"
                    onClick={() => toggle(group.itemId)}
                  >
                    <span className={cn("inline-block text-xs transition-transform", isExpanded && "rotate-90")}>▶</span>
                  </TableCell>
                  <TableCell
                    className="py-3 font-medium text-foreground cursor-pointer hover:underline"
                    onClick={() => navigate(itemTrendPath(group.itemId))}
                  >{group.name}</TableCell>
                  <TableCell className="py-3 text-muted-foreground">{fmtDate(last.date)}</TableCell>
                  <TableCell className="py-3 text-right font-mono font-medium text-foreground">
                    {fmt(last.unitPrice)}{last.uom ? ` / ${last.uom}` : ""}
                  </TableCell>
                  <TableCell className={cn("py-3 text-right", changeCls(change, true))}>
                    {change === null ? "—" : fmtPct(change)}
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell />
                    <TableCell colSpan={4} className="py-3 bg-muted/10">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-muted-foreground">
                            <th className="pb-2 text-left font-semibold uppercase tracking-wider">Date</th>
                            <th className="pb-2 text-right font-semibold uppercase tracking-wider">Qty</th>
                            <th className="pb-2 text-right font-semibold uppercase tracking-wider">UoM</th>
                            <th className="pb-2 text-right font-semibold uppercase tracking-wider">Unit Price (excl. VAT)</th>
                            <th className="pb-2 text-right font-semibold uppercase tracking-wider">vs Previous</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.entries.map((entry, ei) => {
                            const prev = ei > 0 ? group.entries[ei - 1] : null;
                            const pct =
                              prev && prev.unitPrice > 0
                                ? ((entry.unitPrice - prev.unitPrice) / prev.unitPrice) * 100
                                : null;
                            return (
                              <tr key={`${entry.invoiceId}-${ei}`} className="border-t border-border/30">
                                <td className="py-1.5 text-muted-foreground">{fmtDate(entry.date)}</td>
                                <td className="py-1.5 text-right font-mono">{entry.quantity}</td>
                                <td className="py-1.5 text-right text-muted-foreground">{entry.uom ?? "—"}</td>
                                <td className="py-1.5 text-right font-mono font-medium">{fmt(entry.unitPrice)}</td>
                                <td className={cn("py-1.5 text-right", changeCls(pct))}>
                                  {pct === null ? "—" : fmtPct(pct)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

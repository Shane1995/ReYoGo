import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import { cn } from '@reyogo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { fmt, fmtDate, fmtPct } from '../../utils/format';
import { overallChangePct } from '../../utils/stats';
import { changeCls } from '../../utils/styles';
import { itemTrendPath } from '@/components/AppRoutes/routePaths';
import type { ItemGroup } from '../../types';

export function TableView({ groups }: { groups: ItemGroup[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--nav-border)] bg-muted/10 p-10 text-center text-sm text-muted-foreground/60">
        No data for the selected range or search.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-[var(--nav-border)]">
            <TableHead className="w-10 py-2.5" />
            <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 py-2.5">
              Item
            </TableHead>
            <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 py-2.5">
              Last captured
            </TableHead>
            <TableHead className="text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 py-2.5">
              Last unit price
            </TableHead>
            <TableHead className="text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 py-2.5">
              Overall change
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => {
            const last = group.entries[group.entries.length - 1]!;
            const change = overallChangePct(group);
            const isExpanded = expanded.has(group.itemId);
            return (
              <Fragment key={group.itemId}>
                <TableRow className="border-[var(--nav-border)] transition-colors hover:bg-muted/20 group">
                  <TableCell
                    className="w-10 cursor-pointer text-center"
                    onClick={() => toggle(group.itemId)}
                  >
                    <ChevronRightIcon
                      className={cn(
                        'size-3.5 mx-auto transition-all',
                        isExpanded
                          ? 'rotate-90 text-primary'
                          : 'text-muted-foreground/30 group-hover:text-muted-foreground',
                      )}
                    />
                  </TableCell>
                  <TableCell
                    className="py-2.5 font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(itemTrendPath(group.itemId))}
                  >
                    {group.name}
                  </TableCell>
                  <TableCell className="py-2.5 text-sm text-muted-foreground">
                    {fmtDate(last.date)}
                  </TableCell>
                  <TableCell className="py-2.5 text-right font-mono text-sm tabular-nums text-foreground">
                    {fmt(last.unitPrice)}
                    {last.uom ? (
                      <span className="text-muted-foreground/60"> / {last.uom}</span>
                    ) : (
                      ''
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'py-2.5 text-right font-mono text-sm tabular-nums',
                      changeCls(change, true),
                    )}
                  >
                    {change === null ? (
                      <span className="text-muted-foreground/30">—</span>
                    ) : (
                      fmtPct(change)
                    )}
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
                    <TableCell />
                    <TableCell colSpan={4} className="py-3 bg-[var(--nav-accent)]/20">
                      <table className="w-full text-xs">
                        <thead>
                          <tr>
                            <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                              Date
                            </th>
                            <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                              Qty
                            </th>
                            <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                              UoM
                            </th>
                            <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                              Unit price
                            </th>
                            <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                              vs prev
                            </th>
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
                              <tr
                                key={`${entry.invoiceId}-${ei}`}
                                className="border-t border-[var(--nav-border)]/40"
                              >
                                <td className="py-1.5 text-muted-foreground">
                                  {fmtDate(entry.date)}
                                </td>
                                <td className="py-1.5 text-right font-mono tabular-nums">
                                  {entry.quantity}
                                </td>
                                <td className="py-1.5 text-right text-muted-foreground/60">
                                  {entry.uom ?? '—'}
                                </td>
                                <td className="py-1.5 text-right font-mono font-medium tabular-nums">
                                  {fmt(entry.unitPrice)}
                                </td>
                                <td
                                  className={cn(
                                    'py-1.5 text-right font-mono tabular-nums',
                                    changeCls(pct),
                                  )}
                                >
                                  {pct === null ? (
                                    <span className="text-muted-foreground/30">—</span>
                                  ) : (
                                    fmtPct(pct)
                                  )}
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

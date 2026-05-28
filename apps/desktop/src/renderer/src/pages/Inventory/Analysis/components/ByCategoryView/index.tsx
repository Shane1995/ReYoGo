import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import { cn } from '@reyogo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { InsightChips } from '../InsightChips';
import { itemTrendPath } from '@/components/AppRoutes/routePaths';
import { fmt, fmtDate, fmtPct } from '../../utils/format';
import { overallChangePct, groupStats } from '../../utils/stats';
import { changeCls } from '../../utils/styles';
import type { ItemGroup } from '../../types';

export function ByCategoryView({ groups }: { groups: ItemGroup[] }) {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const toggleCat = (key: string) =>
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
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

  const catMap = new Map<string, ItemGroup[]>();
  for (const g of groups) {
    const key = g.categoryName ?? '';
    if (!catMap.has(key)) catMap.set(key, []);
    catMap.get(key)!.push(g);
  }
  const catSections = Array.from(catMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-[var(--nav-border)]">
            <TableHead className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 py-2.5">
              Item
            </TableHead>
            <TableHead className="text-center text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 py-2.5">
              Entries
            </TableHead>
            <TableHead className="text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 py-2.5">
              Min
            </TableHead>
            <TableHead className="text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 py-2.5">
              Avg
            </TableHead>
            <TableHead className="text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 py-2.5">
              Last captured
            </TableHead>
            <TableHead className="text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 py-2.5">
              Last price
            </TableHead>
            <TableHead className="text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 py-2.5">
              Overall change
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {catSections.map(([catName, catGroups]) => {
            const catStats = groupStats(catGroups);
            const isExpanded = expandedCats.has(catName);
            return (
              <Fragment key={catName}>
                <TableRow
                  className="cursor-pointer select-none border-[var(--nav-border)] hover:bg-muted/20 transition-colors"
                  onClick={() => toggleCat(catName)}
                >
                  <TableCell colSpan={7} className="relative py-0">
                    <div className="absolute inset-y-0 left-0 w-0.5 bg-[var(--nav-active-border)]/20" />
                    <div className="flex items-center justify-between pl-5 pr-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <ChevronRightIcon
                          className={cn(
                            'size-3.5 text-muted-foreground/30 transition-transform',
                            isExpanded && 'rotate-90 text-primary',
                          )}
                        />
                        <span className="text-sm font-medium text-foreground/70">
                          {catName || 'Uncategorised'}
                        </span>
                      </div>
                      <InsightChips stats={catStats} />
                    </div>
                  </TableCell>
                </TableRow>

                {isExpanded &&
                  catGroups.map((group) => {
                    const last = group.entries[group.entries.length - 1]!;
                    const change = overallChangePct(group);
                    const minPrice = Math.min(...group.entries.map((e) => e.unitPrice));
                    const avgPrice =
                      group.entries.reduce((s, e) => s + e.unitPrice, 0) / group.entries.length;
                    return (
                      <TableRow
                        key={group.itemId}
                        className="cursor-pointer border-[var(--nav-border)] hover:bg-muted/20 transition-colors"
                        onClick={() => navigate(itemTrendPath(group.itemId))}
                      >
                        <TableCell className="py-2.5 pl-10 font-medium text-foreground hover:text-primary transition-colors">
                          {group.name}
                        </TableCell>
                        <TableCell className="py-2.5 text-center font-mono text-sm tabular-nums text-muted-foreground">
                          {group.entries.length}
                        </TableCell>
                        <TableCell className="py-2.5 text-right font-mono text-sm tabular-nums text-muted-foreground">
                          {fmt(minPrice)}
                        </TableCell>
                        <TableCell className="py-2.5 text-right font-mono text-sm tabular-nums text-muted-foreground">
                          {fmt(avgPrice)}
                        </TableCell>
                        <TableCell className="py-2.5 text-right text-sm text-muted-foreground">
                          {fmtDate(last.date)}
                        </TableCell>
                        <TableCell className="py-2.5 text-right font-mono text-sm tabular-nums font-medium text-foreground">
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
                    );
                  })}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

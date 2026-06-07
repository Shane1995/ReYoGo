import { Fragment, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import { Button, cn } from '@reyogo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { fmt, fmtDate, fmtPct } from '../../utils/format';
import { overallChangePct } from '../../utils/stats';
import { changeCls } from '../../utils/styles';
import { itemTrendPath } from '@/components/AppRoutes/routePaths';
import type { ItemGroup } from '../../types';
import { useTableSort } from '@/hooks/useTableSort';
import { SortIndicator } from '@/components/DataTable/SortIndicator';
import { ExpandedEntries } from './components/ExpandedEntries';

const sortByName = (a: ItemGroup, b: ItemGroup) => a.name.localeCompare(b.name);

const sortByLastCaptured = (a: ItemGroup, b: ItemGroup) => {
  const aDate = a.entries[a.entries.length - 1]?.date.getTime() ?? 0;
  const bDate = b.entries[b.entries.length - 1]?.date.getTime() ?? 0;
  return aDate - bDate;
};

const sortByLastUnitPrice = (a: ItemGroup, b: ItemGroup) => {
  const aPrice = a.entries[a.entries.length - 1]?.unitPriceInclVat ?? 0;
  const bPrice = b.entries[b.entries.length - 1]?.unitPriceInclVat ?? 0;
  return aPrice - bPrice;
};

const sortByOverallChange = (a: ItemGroup, b: ItemGroup) => {
  const aChange = overallChangePct(a);
  const bChange = overallChangePct(b);
  if (aChange == null && bChange == null) return 0;
  if (aChange == null) return 1;
  if (bChange == null) return -1;
  return aChange - bChange;
};

type ToggleFn = (id: string) => void;
type NavigateFn = ReturnType<typeof useNavigate>;

function renderGroupRow(
  group: ItemGroup,
  i: number,
  expanded: Set<string>,
  toggle: ToggleFn,
  navigate: NavigateFn,
) {
  const last = group.entries[group.entries.length - 1]!;
  const change = overallChangePct(group);
  const isExpanded = expanded.has(group.itemId);
  return (
    <Fragment key={group.itemId}>
      <TableRow
        className={cn(
          'border-[var(--nav-border)] transition-colors hover:bg-muted/20 group',
          !isExpanded && i % 2 !== 0 && 'bg-black/[0.025]',
        )}
      >
        <TableCell className="w-10 cursor-pointer text-center" onClick={() => toggle(group.itemId)}>
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
        <TableCell className="py-2.5 text-sm text-muted-foreground">{fmtDate(last.date)}</TableCell>
        <TableCell className="py-2.5 text-right font-mono text-sm tabular-nums text-foreground">
          <div>
            {fmt(last.unitPriceInclVat)}
            {last.uom ? <span className="text-muted-foreground/60"> / {last.uom}</span> : null}
          </div>
          {last.unitPrice !== last.unitPriceInclVat && (
            <div className="text-[11px] text-muted-foreground/50 font-normal">
              excl. {fmt(last.unitPrice)}
            </div>
          )}
        </TableCell>
        <TableCell
          className={cn(
            'py-2.5 text-right font-mono text-sm tabular-nums',
            changeCls(change, true),
          )}
        >
          {change === null ? <span className="text-muted-foreground/30">—</span> : fmtPct(change)}
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
          <TableCell />
          <TableCell colSpan={4} className="py-3 bg-[var(--nav-accent)]/20">
            <ExpandedEntries entries={group.entries} />
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
}

export function TableView({ groups }: { groups: ItemGroup[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const compareFns = useMemo(
    () => ({
      name: sortByName,
      lastCaptured: sortByLastCaptured,
      lastUnitPrice: sortByLastUnitPrice,
      overallChange: sortByOverallChange,
    }),
    [],
  );

  const {
    sortedData: sortedGroups,
    sortKey,
    sortDir,
    toggleSort,
  } = useTableSort(groups, compareFns);

  const renderSortHead = (key: string, label: string, className?: string) => {
    const isActive = sortKey === key;
    return (
      <TableHead
        className={cn(
          'text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 py-2.5',
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
            {renderSortHead('name', 'Item')}
            {renderSortHead('lastCaptured', 'Last captured')}
            {renderSortHead('lastUnitPrice', 'Last unit price', 'text-right')}
            {renderSortHead('overallChange', 'Overall change', 'text-right')}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedGroups.map((group, i) => renderGroupRow(group, i, expanded, toggle, navigate))}
        </TableBody>
      </Table>
    </div>
  );
}

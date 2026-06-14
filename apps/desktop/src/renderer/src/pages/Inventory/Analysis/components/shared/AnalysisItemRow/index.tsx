import { cn, TableCell, TableRow } from '@reyogo/ui';
import { fmt, fmtDate, fmtPct } from '../../../utils/format';
import { overallChangePct } from '../../../utils/stats';
import { changeCls } from '../../../utils/styles';
import type { AnalysisItemRowProps } from './types';

export function AnalysisItemRow({ group, rowIndex = 0, onNavigate }: AnalysisItemRowProps) {
  const last = group.entries[group.entries.length - 1]!;
  const change = overallChangePct(group);
  const minPrice = Math.min(...group.entries.map((e) => e.unitPrice));
  const avgPrice = group.entries.reduce((s, e) => s + e.unitPrice, 0) / group.entries.length;
  return (
    <TableRow
      className={cn(
        'cursor-pointer border-[var(--nav-border)] hover:bg-muted/20 transition-colors',
        rowIndex % 2 !== 0 && 'bg-black/[0.025]',
      )}
      onClick={() => onNavigate(group.itemId)}
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
        {last.uom ? <span className="text-muted-foreground/60"> / {last.uom}</span> : ''}
      </TableCell>
      <TableCell
        className={cn('py-2.5 text-right font-mono text-sm tabular-nums', changeCls(change, true))}
      >
        {change === null ? <span className="text-muted-foreground/30">—</span> : fmtPct(change)}
      </TableCell>
    </TableRow>
  );
}

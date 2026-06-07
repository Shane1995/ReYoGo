import { TableHead, TableHeader, TableRow } from '@reyogo/ui';

export function AnalysisTableHeader() {
  return (
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
  );
}

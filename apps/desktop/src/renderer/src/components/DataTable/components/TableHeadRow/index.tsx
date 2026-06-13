import { cn, TableHead, TableRow } from '@reyogo/ui';
import { alignClass } from '../../utils/alignClass';
import { ColumnHeaderContent } from '../ColumnHeaderContent';
import type { TableHeadRowProps } from './types';

export function TableHeadRow<T>({ columns, sortKey, sortDir, toggleSort }: TableHeadRowProps<T>) {
  return (
    <TableRow className="bg-muted/30 hover:bg-muted/30 border-[var(--nav-border)]">
      {columns.map((col) => (
        <TableHead
          key={col.key}
          style={col.width ? { width: col.width } : undefined}
          className={cn(
            'text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 py-2.5',
            alignClass(col.align),
          )}
        >
          <ColumnHeaderContent
            col={col}
            sortKey={sortKey}
            sortDir={sortDir}
            toggleSort={toggleSort}
          />
        </TableHead>
      ))}
    </TableRow>
  );
}

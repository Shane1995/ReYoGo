import { cn, TableCell, TableRow } from '@reyogo/ui';
import { alignClass } from '../../utils/alignClass';
import type { TableBodyRowsProps } from './types';

export function TableBodyRows<T>({
  sortedData,
  columns,
  rowKey,
  emptyMessage,
}: TableBodyRowsProps<T>) {
  if (sortedData.length === 0) {
    return (
      <TableRow>
        <TableCell
          colSpan={columns.length}
          className="py-16 text-center text-sm text-muted-foreground/60"
        >
          {emptyMessage}
        </TableCell>
      </TableRow>
    );
  }
  return (
    <>
      {sortedData.map((row, i) => (
        <TableRow
          key={rowKey(row)}
          className={cn(
            'border-[var(--nav-border)] transition-colors hover:bg-muted/20 group',
            i % 2 !== 0 && 'bg-black/[0.025]',
          )}
        >
          {columns.map((col) => (
            <TableCell key={col.key} className={cn('py-2.5 px-4', alignClass(col.align))}>
              {col.cell(row)}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

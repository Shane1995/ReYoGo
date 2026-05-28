import { cn } from '@reyogo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { FilterBar } from './FilterBar';
import type { ColumnDef, FilterField, FilterValues } from './types';

export type { ColumnDef, FilterField, FilterValues };

type Props<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  filters?: FilterField[];
  filterValues?: FilterValues;
  onFilterChange?: (key: string, value: string | string[]) => void;
  onClearFilters?: () => void;
  emptyMessage?: string;
  rowKey: (row: T) => string;
};

const alignClass = (align?: 'left' | 'right' | 'center') => {
  if (align === 'right') return 'text-right';
  if (align === 'center') return 'text-center';
  return 'text-left';
};

export function DataTable<T>({
  columns,
  data,
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  emptyMessage = 'No items found.',
  rowKey,
}: Props<T>) {
  return (
    <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden">
      {filters.length > 0 && onFilterChange && onClearFilters && (
        <FilterBar
          filters={filters}
          values={filterValues}
          onChange={onFilterChange}
          onClearAll={onClearFilters}
        />
      )}

      <Table>
        <TableHeader>
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
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-16 text-center text-sm text-muted-foreground/60"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow
                key={rowKey(row)}
                className="border-[var(--nav-border)] transition-colors hover:bg-muted/20 group"
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={cn('py-2.5 px-4', alignClass(col.align))}>
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

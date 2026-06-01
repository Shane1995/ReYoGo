import { useMemo } from 'react';
import { cn, Button } from '@reyogo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { useTableSort } from '@/hooks/useTableSort';
import { SortIndicator } from './SortIndicator';
import { FilterBar } from './FilterBar/index';
import type { ColumnDef, FilterField, FilterValues } from './types';

export type { ColumnDef, FilterField, FilterValues };
export { FilterBar };

type Props<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  filters?: FilterField[];
  filterValues?: FilterValues;
  onFilterChange?: (key: string, value: string | string[]) => void;
  onClearFilters?: () => void;
  hideFilters?: boolean;
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
  hideFilters = false,
  emptyMessage = 'No items found.',
  rowKey,
}: Props<T>) {
  const compareFns = useMemo(() => {
    const result: Record<string, (a: T, b: T) => number> = {};
    for (const col of columns) {
      if (col.sortFn) result[col.key] = col.sortFn;
    }
    return result;
  }, [columns]);

  const { sortedData, sortKey, sortDir, toggleSort } = useTableSort(data, compareFns);

  return (
    <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden">
      {!hideFilters && filters.length > 0 && onFilterChange && onClearFilters && (
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
            {columns.map((col) => {
              const { sortFn } = col;
              return (
                <TableHead
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(
                    'text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 py-2.5',
                    alignClass(col.align),
                  )}
                >
                  {col.sortable && sortFn ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-mx-2 h-auto py-0 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 hover:text-foreground hover:bg-transparent inline-flex items-center"
                      onClick={() => toggleSort(col.key)}
                    >
                      {col.header}
                      <SortIndicator
                        active={sortKey === col.key}
                        dir={sortKey === col.key ? sortDir : null}
                      />
                    </Button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-16 text-center text-sm text-muted-foreground/60"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((row, i) => (
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

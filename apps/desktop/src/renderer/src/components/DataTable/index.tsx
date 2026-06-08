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
  compareFns?: Record<string, (a: T, b: T) => number>;
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

function TableHeadRow<T>({
  columns,
  sortKey,
  sortDir,
  toggleSort,
}: {
  columns: ColumnDef<T>[];
  sortKey: string | null;
  sortDir: 'asc' | 'desc' | null;
  toggleSort: (key: string) => void;
}) {
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

function isSortableColumn<T>(col: ColumnDef<T>): boolean {
  return Boolean(col.sortable && col.sortFn);
}

function ColumnHeaderContent<T>({
  col,
  sortKey,
  sortDir,
  toggleSort,
}: {
  col: ColumnDef<T>;
  sortKey: string | null;
  sortDir: 'asc' | 'desc' | null;
  toggleSort: (key: string) => void;
}) {
  if (!isSortableColumn(col)) return <>{col.header}</>;
  const isActive = sortKey === col.key;
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-mx-2 h-auto py-0 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 hover:text-foreground hover:bg-transparent inline-flex items-center"
      onClick={() => toggleSort(col.key)}
    >
      {col.header}
      <SortIndicator active={isActive} dir={isActive ? sortDir : null} />
    </Button>
  );
}

function TableBodyRows<T>({
  sortedData,
  columns,
  rowKey,
  emptyMessage,
}: {
  sortedData: T[];
  columns: ColumnDef<T>[];
  rowKey: (row: T) => string;
  emptyMessage: string;
}) {
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

function shouldRenderFilters(hideFilters: boolean, filterCount: number): boolean {
  if (hideFilters) return false;
  return filterCount > 0;
}

function FilterBarSection({
  hideFilters,
  filters,
  filterValues,
  onFilterChange,
  onClearFilters,
}: {
  hideFilters: boolean;
  filters: FilterField[];
  filterValues: FilterValues;
  onFilterChange: ((key: string, value: string | string[]) => void) | undefined;
  onClearFilters: (() => void) | undefined;
}) {
  if (!shouldRenderFilters(hideFilters, filters.length)) return null;
  if (!onFilterChange || !onClearFilters) return null;
  return (
    <FilterBar
      filters={filters}
      values={filterValues}
      onChange={onFilterChange}
      onClearAll={onClearFilters}
    />
  );
}

export function DataTable<T>({
  columns,
  data,
  compareFns: compareFnsProp,
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  hideFilters = false,
  emptyMessage = 'No items found.',
  rowKey,
}: Props<T>) {
  const derivedCompareFns = useMemo(() => {
    if (compareFnsProp) return compareFnsProp;
    const result: Record<string, (a: T, b: T) => number> = {};
    for (const col of columns) {
      if (col.sortFn) result[col.key] = col.sortFn;
    }
    return result;
  }, [compareFnsProp, columns]);

  const { sortedData, sortKey, sortDir, toggleSort } = useTableSort(data, derivedCompareFns);

  return (
    <div className="rounded-lg border border-[var(--nav-border)] overflow-hidden">
      <FilterBarSection
        hideFilters={hideFilters}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
      />
      <Table>
        <TableHeader>
          <TableHeadRow
            columns={columns}
            sortKey={sortKey}
            sortDir={sortDir}
            toggleSort={toggleSort}
          />
        </TableHeader>
        <TableBody>
          <TableBodyRows
            sortedData={sortedData}
            columns={columns}
            rowKey={rowKey}
            emptyMessage={emptyMessage}
          />
        </TableBody>
      </Table>
    </div>
  );
}

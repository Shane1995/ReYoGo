import { useMemo } from 'react';
import { Table, TableBody, TableHeader } from '@reyogo/ui';
import { useTableSort } from '@/hooks/useTableSort';
import { FilterBar } from './FilterBar/index';
import { TableHeadRow } from './components/TableHeadRow';
import { TableBodyRows } from './components/TableBodyRows';
import { FilterBarSection } from './components/FilterBarSection';
import { deriveCompareFns } from './utils/deriveCompareFns';
import type { ColumnDef, FilterField, FilterValues, DataTableProps } from './types';

export type { ColumnDef, FilterField, FilterValues };
export { FilterBar };

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
}: DataTableProps<T>) {
  const derivedCompareFns = useMemo(
    () => compareFnsProp ?? deriveCompareFns(columns),
    [compareFnsProp, columns],
  );

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

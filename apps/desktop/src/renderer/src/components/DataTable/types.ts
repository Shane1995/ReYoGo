import type { ReactNode } from 'react';

export type Align = 'left' | 'right' | 'center';

export interface ColumnDef<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: Align;
  width?: string;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
}

export type FilterOption = { value: string; label: string; group?: string };

export interface FilterField {
  key: string;
  label: string;
  type: 'search' | 'select';
  multi?: boolean;
  options?: FilterOption[] | ((values: FilterValues) => FilterOption[]);
  placeholder?: string;
}

export type FilterValues = Record<string, string | string[]>;

export type DataTableProps<T> = {
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

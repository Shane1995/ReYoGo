import type { ColumnDef } from '../../types';

export type TableBodyRowsProps<T> = {
  sortedData: T[];
  columns: ColumnDef<T>[];
  rowKey: (row: T) => string;
  emptyMessage: string;
};

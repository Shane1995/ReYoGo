import type { SortDir } from '@/hooks/useTableSort';
import type { ColumnDef } from '../../types';

export type TableHeadRowProps<T> = {
  columns: ColumnDef<T>[];
  sortKey: string | null;
  sortDir: SortDir;
  toggleSort: (key: string) => void;
};

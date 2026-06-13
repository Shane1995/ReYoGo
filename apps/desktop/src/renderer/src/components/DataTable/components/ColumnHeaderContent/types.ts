import type { SortDir } from '@/hooks/useTableSort';
import type { ColumnDef } from '../../types';

export type ColumnHeaderContentProps<T> = {
  col: ColumnDef<T>;
  sortKey: string | null;
  sortDir: SortDir;
  toggleSort: (key: string) => void;
};

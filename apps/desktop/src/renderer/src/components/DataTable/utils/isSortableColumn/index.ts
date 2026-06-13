import type { ColumnDef } from '../../types';

export function isSortableColumn<T>(col: ColumnDef<T>): boolean {
  return Boolean(col.sortable && col.sortFn);
}

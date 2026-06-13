import type { ColumnDef } from '../../types';

export function deriveCompareFns<T>(
  columns: ColumnDef<T>[],
): Record<string, (a: T, b: T) => number> {
  return columns.reduce<Record<string, (a: T, b: T) => number>>((acc, col) => {
    if (!col.sortFn) return acc;
    return { ...acc, [col.key]: col.sortFn };
  }, {});
}

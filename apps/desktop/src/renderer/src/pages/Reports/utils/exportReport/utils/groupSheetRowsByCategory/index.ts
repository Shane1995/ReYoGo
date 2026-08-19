import { groupByCategory } from '../../../groupByCategory';

export function groupSheetRowsByCategory<T>(
  rows: T[],
  categoryOf: (row: T) => string | undefined,
  rowOf: (row: T) => (string | number)[],
): (string | number)[][] {
  const buckets = groupByCategory(rows, categoryOf);
  return buckets.flatMap((bucket) => [[bucket.category], ...bucket.rows.map(rowOf)]);
}

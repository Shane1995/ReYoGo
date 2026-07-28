import { UNCATEGORIZED_CATEGORY_LABEL } from '../../constants';
import type { CategoryBucket } from './types';

export function groupByCategory<T>(
  rows: T[],
  categoryOf: (row: T) => string | undefined,
): CategoryBucket<T>[] {
  const buckets = new Map<string, T[]>();
  for (const row of rows) {
    const category = categoryOf(row) || UNCATEGORIZED_CATEGORY_LABEL;
    const bucketRows = buckets.get(category) ?? [];
    buckets.set(category, [...bucketRows, row]);
  }
  return Array.from(buckets.entries())
    .map(([category, bucketRows]) => ({ category, rows: bucketRows }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

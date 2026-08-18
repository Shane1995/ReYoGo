import type { CategoryBucket } from '@/pages/Reports/utils/groupByCategory/types';
import type { CountSheetRow } from '../../types';

export function filterBucketsByName(
  buckets: CategoryBucket<CountSheetRow>[],
  query: string,
): CategoryBucket<CountSheetRow>[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return buckets;
  return buckets
    .map((bucket) => ({
      ...bucket,
      rows: bucket.rows.filter((row) => row.itemName.toLowerCase().includes(trimmed)),
    }))
    .filter((bucket) => bucket.rows.length > 0);
}

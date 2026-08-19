import { categorySummaryOf } from '../../components/CountSheetTable/utils/categorySummaryOf';
import type { CategoryBucket } from '@/pages/Reports/utils/groupByCategory/types';
import type { CountSheetRow } from '../../types';
import type { StockTakeSummary } from './types';

export function stockTakeSummaryOf(buckets: CategoryBucket<CountSheetRow>[]): StockTakeSummary {
  return buckets.reduce<StockTakeSummary>(
    (summary, bucket) => {
      const category = categorySummaryOf(bucket.rows);
      return {
        countedCount: summary.countedCount + category.countedCount,
        totalCount: summary.totalCount + category.totalCount,
        categoryCount: summary.categoryCount + 1,
        totalValue: summary.totalValue + category.value,
      };
    },
    { countedCount: 0, totalCount: 0, categoryCount: 0, totalValue: 0 },
  );
}

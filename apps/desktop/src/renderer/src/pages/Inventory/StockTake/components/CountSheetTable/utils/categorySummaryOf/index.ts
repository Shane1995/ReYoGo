import type { CountSheetRow } from '../../../../types';
import type { CategorySummary } from './types';

export function categorySummaryOf(rows: CountSheetRow[]): CategorySummary {
  return rows.reduce<CategorySummary>(
    (summary, row) => ({
      countedCount: summary.countedCount + (row.countedQty !== null ? 1 : 0),
      totalCount: summary.totalCount + 1,
      value: summary.value + (row.lineValue ?? 0),
    }),
    { countedCount: 0, totalCount: 0, value: 0 },
  );
}

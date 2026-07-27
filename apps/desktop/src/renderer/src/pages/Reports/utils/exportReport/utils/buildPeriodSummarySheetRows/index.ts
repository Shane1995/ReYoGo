import type { COGSSummary } from '@reyogo/types';
import { UNCATEGORIZED_CATEGORY_LABEL } from '../../../../constants';
import { roundTo } from '../roundTo';

const HEADER = ['Category', 'COGS', '% of Total'];

function pctOf(rowTotal: number, total: number): string {
  if (total <= 0) return '—';
  return `${((rowTotal / total) * 100).toFixed(1)}%`;
}

function categoryRowOf(row: COGSSummary['byCategory'][number], total: number): (string | number)[] {
  return [
    row.categoryName ?? UNCATEGORIZED_CATEGORY_LABEL,
    roundTo(row.total, 2),
    pctOf(row.total, total),
  ];
}

export function buildPeriodSummarySheetRows(cogs: COGSSummary): (string | number)[][] {
  const categoryRows = cogs.byCategory.map((row) => categoryRowOf(row, cogs.total));
  const totalRow = ['Total', roundTo(cogs.total, 2), pctOf(cogs.total, cogs.total)];
  return [HEADER, ...categoryRows, totalRow];
}

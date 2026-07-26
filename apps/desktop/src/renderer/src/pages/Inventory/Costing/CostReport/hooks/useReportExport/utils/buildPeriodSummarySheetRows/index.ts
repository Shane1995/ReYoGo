import type { COGSSummary } from '@reyogo/types';

const HEADER = ['Category', 'COGS', '% of Total'];

function pctOf(rowTotal: number, total: number): string {
  if (total <= 0) return '—';
  return `${((rowTotal / total) * 100).toFixed(1)}%`;
}

function categoryRowOf(row: COGSSummary['byCategory'][number], total: number): (string | number)[] {
  return [row.categoryName ?? 'Uncategorised', row.total, pctOf(row.total, total)];
}

export function buildPeriodSummarySheetRows(cogs: COGSSummary): (string | number)[][] {
  const categoryRows = cogs.byCategory.map((row) => categoryRowOf(row, cogs.total));
  const totalRow = ['Total', cogs.total, pctOf(cogs.total, cogs.total)];
  return [HEADER, ...categoryRows, totalRow];
}

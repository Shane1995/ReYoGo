import type { ReportView } from '../../../../types';

function dateRangeSuffix(fromDate: string, toDate: string): string {
  if (fromDate && toDate) return `${fromDate}-to-${toDate}`;
  if (fromDate) return `from-${fromDate}`;
  if (toDate) return `to-${toDate}`;
  return 'all-dates';
}

export function reportFilename(view: ReportView, fromDate: string, toDate: string): string {
  return `reyogo-${view}-${dateRangeSuffix(fromDate, toDate)}.xlsx`;
}

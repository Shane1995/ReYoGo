import type { ReportView } from '../../../../types';

function hasBothDates(fromDate: string, toDate: string): boolean {
  return Boolean(fromDate) && Boolean(toDate);
}

function singleDateSuffix(fromDate: string, toDate: string): string {
  if (fromDate) return `from-${fromDate}`;
  if (toDate) return `to-${toDate}`;
  return 'all-dates';
}

function dateRangeSuffix(fromDate: string, toDate: string): string {
  if (hasBothDates(fromDate, toDate)) return `${fromDate}-to-${toDate}`;
  return singleDateSuffix(fromDate, toDate);
}

export function reportFilename(view: ReportView, fromDate = '', toDate = ''): string {
  return `reyogo-${view}-${dateRangeSuffix(fromDate, toDate)}.xlsx`;
}

import { AS_OF_DATE_REPORT_VIEWS } from '../../../../constants';
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

function asOfSuffix(asOfDate: string): string {
  return asOfDate ? `as-of-${asOfDate}` : 'live';
}

export function reportFilename(
  view: ReportView,
  fromDate = '',
  toDate = '',
  asOfDate = '',
): string {
  const suffix = AS_OF_DATE_REPORT_VIEWS.includes(view)
    ? asOfSuffix(asOfDate)
    : dateRangeSuffix(fromDate, toDate);
  return `reyogo-${view}-${suffix}.xlsx`;
}

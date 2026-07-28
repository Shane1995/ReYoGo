import type { ExportRequest } from '../../../../types';

function hasBothDates(fromDate: string, toDate: string): boolean {
  return Boolean(fromDate) && Boolean(toDate);
}

function singleDateLabel(fromDate: string, toDate: string): string {
  if (fromDate) return `From ${fromDate}`;
  if (toDate) return `To ${toDate}`;
  return 'All dates';
}

function dateRangeLabel(fromDate: string, toDate: string): string {
  if (hasBothDates(fromDate, toDate)) return `${fromDate} to ${toDate}`;
  return singleDateLabel(fromDate, toDate);
}

function asOfLabel(asOfDate: string): string {
  return asOfDate || 'Live';
}

export function metadataRowsOf(request: ExportRequest): (string | number)[][] {
  if ('asOfDate' in request) {
    return [[`As of: ${asOfLabel(request.asOfDate)}`], []];
  }
  return [[`Date range: ${dateRangeLabel(request.fromDate, request.toDate)}`], []];
}

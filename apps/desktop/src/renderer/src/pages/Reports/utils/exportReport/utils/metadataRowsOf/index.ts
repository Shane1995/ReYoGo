import type { ExportRequest } from '../../../../types';

function dateRangeLabel(fromDate: string, toDate: string): string {
  if (fromDate && toDate) return `${fromDate} to ${toDate}`;
  if (fromDate) return `From ${fromDate}`;
  if (toDate) return `To ${toDate}`;
  return 'All dates';
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

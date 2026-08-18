import * as XLSX from 'xlsx';
import { shellService } from '@/services/shell';
import { reportFilename } from './utils/reportFilename';
import { metadataRowsOf } from './utils/metadataRowsOf';
import { buildItemCostHistorySheetRows } from './utils/buildItemCostHistorySheetRows';
import { buildPeriodSummarySheetRows } from './utils/buildPeriodSummarySheetRows';
import { buildStockValuationSheetRows } from './utils/buildStockValuationSheetRows';
import { buildStockOnHandSheetRows } from './utils/buildStockOnHandSheetRows';
import { buildPurchaseReportSheetRows } from './utils/buildPurchaseReportSheetRows';
import { buildCreditReportSheetRows } from './utils/buildCreditReportSheetRows';
import { columnWidthsOf } from './utils/columnWidthsOf';
import { ReportView } from '../../types';
import type { ExportRequest } from '../../types';

// Discriminated-union dispatch over ReportView; a lookup table would need `as` casts per variant.
// fallow-ignore-next-line complexity
function sheetRowsOf(request: ExportRequest): (string | number)[][] {
  if (request.view === ReportView.ItemCostHistory) {
    return buildItemCostHistorySheetRows(request.rows);
  }
  if (request.view === ReportView.PeriodSummary) {
    return buildPeriodSummarySheetRows(request.cogs);
  }
  if (request.view === ReportView.StockValuation) {
    return buildStockValuationSheetRows(request.rows);
  }
  if (request.view === ReportView.StockOnHand) {
    return buildStockOnHandSheetRows(request.rows);
  }
  if (request.view === ReportView.PurchaseReport) {
    return buildPurchaseReportSheetRows(request.rows);
  }
  return buildCreditReportSheetRows(request.rows);
}

function datesOf(request: ExportRequest): { fromDate: string; toDate: string } {
  if ('fromDate' in request) return { fromDate: request.fromDate, toDate: request.toDate };
  return { fromDate: '', toDate: '' };
}

function asOfDateOf(request: ExportRequest): string {
  return 'asOfDate' in request ? request.asOfDate : '';
}

export async function exportReport(request: ExportRequest): Promise<void> {
  const dataRows = sheetRowsOf(request);
  const columnWidths = columnWidthsOf(dataRows);
  const sheetRows = [...metadataRowsOf(request), ...dataRows];

  const wb = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet(sheetRows);
  sheet['!cols'] = columnWidths;
  XLSX.utils.book_append_sheet(wb, sheet, 'Report');

  const base64: string = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
  const { fromDate, toDate } = datesOf(request);
  const asOfDate = asOfDateOf(request);
  const filename = reportFilename(request.view, fromDate, toDate, asOfDate);
  await shellService.saveFileBase64({ filename, base64 });
}

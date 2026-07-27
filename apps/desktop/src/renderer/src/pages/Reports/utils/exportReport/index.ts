import * as XLSX from 'xlsx';
import { shellService } from '@/services/shell';
import { reportFilename } from './utils/reportFilename';
import { buildItemCostHistorySheetRows } from './utils/buildItemCostHistorySheetRows';
import { buildPeriodSummarySheetRows } from './utils/buildPeriodSummarySheetRows';
import { buildStockValuationSheetRows } from './utils/buildStockValuationSheetRows';
import { buildStockOnHandSheetRows } from './utils/buildStockOnHandSheetRows';
import { columnWidthsOf } from './utils/columnWidthsOf';
import { ReportView } from '../../types';
import type { ExportRequest } from '../../types';

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
  return buildStockOnHandSheetRows(request.rows);
}

function datesOf(request: ExportRequest): { fromDate: string; toDate: string } {
  if ('fromDate' in request) return { fromDate: request.fromDate, toDate: request.toDate };
  return { fromDate: '', toDate: '' };
}

export async function exportReport(request: ExportRequest): Promise<void> {
  const rows = sheetRowsOf(request);
  const wb = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet['!cols'] = columnWidthsOf(rows);
  XLSX.utils.book_append_sheet(wb, sheet, 'Report');

  const base64: string = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
  const { fromDate, toDate } = datesOf(request);
  const filename = reportFilename(request.view, fromDate, toDate);
  await shellService.saveFileBase64({ filename, base64 });
}

import * as XLSX from 'xlsx';
import { reportFilename } from './utils/reportFilename';
import { buildItemCostHistorySheetRows } from './utils/buildItemCostHistorySheetRows';
import { buildPeriodSummarySheetRows } from './utils/buildPeriodSummarySheetRows';
import type { ExportRequest } from '../../types';

function sheetRowsOf(request: ExportRequest): (string | number)[][] {
  if (request.view === 'item-cost-history') return buildItemCostHistorySheetRows(request.rows);
  return buildPeriodSummarySheetRows(request.cogs);
}

async function exportReport(request: ExportRequest): Promise<void> {
  const wb = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet(sheetRowsOf(request));
  XLSX.utils.book_append_sheet(wb, sheet, 'Report');

  const base64: string = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
  const filename = reportFilename(request.view, request.fromDate, request.toDate);
  await window.electronAPI.ipcRenderer.invoke('shell:save-file-base64', { filename, base64 });
}

export function useReportExport() {
  return { exportReport };
}

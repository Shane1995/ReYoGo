import type { COGSSummary } from '@reyogo/types';
import { ReportView } from '../../types';
import type { ExportRequest } from '../../types';
import type { ExportState } from './types';

function periodSummaryRequestOf(
  cogs: COGSSummary | null,
  fromDate: string,
  toDate: string,
): ExportRequest | null {
  if (!cogs) return null;
  return { view: ReportView.PeriodSummary, cogs, fromDate, toDate };
}

export function exportRequestOf(state: ExportState): ExportRequest | null {
  if (state.activeView === ReportView.ItemCostHistory) {
    return {
      view: ReportView.ItemCostHistory,
      rows: state.itemCostHistoryRows,
      fromDate: state.fromDate,
      toDate: state.toDate,
    };
  }
  if (state.activeView === ReportView.PeriodSummary) {
    return periodSummaryRequestOf(state.periodSummaryCogs, state.fromDate, state.toDate);
  }
  if (state.activeView === ReportView.StockValuation) {
    return {
      view: ReportView.StockValuation,
      rows: state.stockValuationRows,
      asOfDate: state.asOfDate,
    };
  }
  if (state.activeView === ReportView.StockOnHand) {
    return { view: ReportView.StockOnHand, rows: state.stockOnHandRows, asOfDate: state.asOfDate };
  }
  if (state.activeView === ReportView.PurchaseReport) {
    return {
      view: ReportView.PurchaseReport,
      rows: state.purchaseReportRows,
      fromDate: state.fromDate,
      toDate: state.toDate,
    };
  }
  return {
    view: ReportView.CreditReport,
    rows: state.creditReportRows,
    fromDate: state.fromDate,
    toDate: state.toDate,
  };
}

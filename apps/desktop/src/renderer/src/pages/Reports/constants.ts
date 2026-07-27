import { ReportView } from './types';

export const PRICE_CHANGE_ALERT_THRESHOLD_PERCENT = 10;

export const REPORT_VIEW_LABELS: Array<{ key: ReportView; label: string }> = [
  { key: ReportView.ItemCostHistory, label: 'Item Cost History' },
  { key: ReportView.PeriodSummary, label: 'Period Summary' },
  { key: ReportView.StockValuation, label: 'Stock Valuation' },
  { key: ReportView.StockOnHand, label: 'Stock on Hand' },
];

export const DATE_RANGE_REPORT_VIEWS: ReportView[] = [
  ReportView.ItemCostHistory,
  ReportView.PeriodSummary,
];

export const AS_OF_DATE_REPORT_VIEWS: ReportView[] = [
  ReportView.StockValuation,
  ReportView.StockOnHand,
];

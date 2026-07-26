import type { ReportView } from './types';

export const PRICE_CHANGE_ALERT_THRESHOLD_PERCENT = 10;

export const REPORT_VIEW_LABELS: Array<{ key: ReportView; label: string }> = [
  { key: 'item-cost-history', label: 'Item Cost History' },
  { key: 'period-summary', label: 'Period Summary' },
];

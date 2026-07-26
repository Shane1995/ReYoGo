import type { COGSSummary } from '@reyogo/types';
import type { ItemCostHistoryRow } from './components/ItemCostHistoryView/types';

export type ReportView = 'item-cost-history' | 'period-summary';

export type ExportRequest =
  | { view: 'item-cost-history'; rows: ItemCostHistoryRow[]; fromDate: string; toDate: string }
  | { view: 'period-summary'; cogs: COGSSummary; fromDate: string; toDate: string };

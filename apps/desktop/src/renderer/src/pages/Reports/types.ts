import type { COGSSummary } from '@reyogo/types';
import type { ItemCostHistoryRow } from './components/ItemCostHistoryView/types';

export enum ReportView {
  ItemCostHistory = 'item-cost-history',
  PeriodSummary = 'period-summary',
}

export type ExportRequest =
  | {
      view: ReportView.ItemCostHistory;
      rows: ItemCostHistoryRow[];
      fromDate: string;
      toDate: string;
    }
  | { view: ReportView.PeriodSummary; cogs: COGSSummary; fromDate: string; toDate: string };

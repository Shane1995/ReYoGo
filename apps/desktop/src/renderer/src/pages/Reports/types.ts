import type { COGSSummary } from '@reyogo/types';
import type { ItemCostHistoryRow } from './components/ItemCostHistoryView/types';
import type { StockLevelRow } from './hooks/useStockLevelRows/types';

export enum ReportView {
  ItemCostHistory = 'item-cost-history',
  PeriodSummary = 'period-summary',
  StockValuation = 'stock-valuation',
  StockOnHand = 'stock-on-hand',
}

export type ExportRequest =
  | {
      view: ReportView.ItemCostHistory;
      rows: ItemCostHistoryRow[];
      fromDate: string;
      toDate: string;
    }
  | { view: ReportView.PeriodSummary; cogs: COGSSummary; fromDate: string; toDate: string }
  | { view: ReportView.StockValuation; rows: StockLevelRow[] }
  | { view: ReportView.StockOnHand; rows: StockLevelRow[] };

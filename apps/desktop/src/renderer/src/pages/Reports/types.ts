import type { COGSSummary } from '@reyogo/types';
import type { ItemCostHistoryRow } from './components/ItemCostHistoryView/types';
import type { StockLevelRow } from './hooks/useStockLevelRows/types';
import type { ItemTotalRow } from './utils/itemTotalRowsOf/types';

export enum ReportView {
  ItemCostHistory = 'item-cost-history',
  PeriodSummary = 'period-summary',
  StockValuation = 'stock-valuation',
  StockOnHand = 'stock-on-hand',
  PurchaseReport = 'purchase-report',
  CreditReport = 'credit-report',
}

export type ExportRequest =
  | {
      view: ReportView.ItemCostHistory;
      rows: ItemCostHistoryRow[];
      fromDate: string;
      toDate: string;
    }
  | { view: ReportView.PeriodSummary; cogs: COGSSummary; fromDate: string; toDate: string }
  | { view: ReportView.StockValuation; rows: StockLevelRow[]; asOfDate: string }
  | { view: ReportView.StockOnHand; rows: StockLevelRow[]; asOfDate: string }
  | { view: ReportView.PurchaseReport; rows: ItemTotalRow[]; fromDate: string; toDate: string }
  | { view: ReportView.CreditReport; rows: ItemTotalRow[]; fromDate: string; toDate: string };

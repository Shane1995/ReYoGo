import type { COGSSummary } from '@reyogo/types';
import type { ReportView } from '../../types';
import type { ItemCostHistoryRow } from '../../components/ItemCostHistoryView/types';
import type { StockLevelRow } from '../../hooks/useStockLevelRows/types';

export type ExportState = {
  activeView: ReportView;
  fromDate: string;
  toDate: string;
  asOfDate: string;
  itemCostHistoryRows: ItemCostHistoryRow[];
  periodSummaryCogs: COGSSummary | null;
  stockValuationRows: StockLevelRow[];
  stockOnHandRows: StockLevelRow[];
};

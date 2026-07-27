import type { COGSSummary } from '@reyogo/types';
import type { ReportView } from '../../types';
import type { ItemCostHistoryRow } from '../ItemCostHistoryView/types';
import type { StockLevelRow } from '../../hooks/useStockLevelRows/types';

export type ActiveReportViewProps = {
  activeView: ReportView;
  fromDate: string;
  toDate: string;
  asOfDate: string;
  entityId: string | undefined;
  selectedCategories: string[];
  selectedType: string;
  onItemCostHistoryRowsChange: (rows: ItemCostHistoryRow[]) => void;
  onPeriodSummaryCogsChange: (cogs: COGSSummary | null) => void;
  onStockValuationRowsChange: (rows: StockLevelRow[]) => void;
  onStockOnHandRowsChange: (rows: StockLevelRow[]) => void;
  onAvailableCategoriesChange: (categories: string[]) => void;
  onAvailableTypesChange: (types: string[]) => void;
};

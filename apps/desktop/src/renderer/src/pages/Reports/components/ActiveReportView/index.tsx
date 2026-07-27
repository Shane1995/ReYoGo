import { ReportView } from '../../types';
import { ItemCostHistoryView } from '../ItemCostHistoryView';
import { PeriodSummaryView } from '../PeriodSummaryView';
import { StockValuationView } from '../StockValuationView';
import { StockOnHandView } from '../StockOnHandView';
import type { ActiveReportViewProps } from './types';

export function ActiveReportView({
  activeView,
  fromDate,
  toDate,
  asOfDate,
  entityId,
  onItemCostHistoryRowsChange,
  onPeriodSummaryCogsChange,
  onStockValuationRowsChange,
  onStockOnHandRowsChange,
}: ActiveReportViewProps) {
  if (activeView === ReportView.ItemCostHistory) {
    return (
      <ItemCostHistoryView
        fromDate={fromDate}
        toDate={toDate}
        entityId={entityId}
        onRowsChange={onItemCostHistoryRowsChange}
      />
    );
  }
  if (activeView === ReportView.PeriodSummary) {
    return (
      <PeriodSummaryView
        fromDate={fromDate}
        toDate={toDate}
        entityId={entityId}
        onCogsChange={onPeriodSummaryCogsChange}
      />
    );
  }
  if (activeView === ReportView.StockValuation) {
    return (
      <StockValuationView
        entityId={entityId}
        asOfDate={asOfDate}
        onRowsChange={onStockValuationRowsChange}
      />
    );
  }
  return (
    <StockOnHandView
      entityId={entityId}
      asOfDate={asOfDate}
      onRowsChange={onStockOnHandRowsChange}
    />
  );
}

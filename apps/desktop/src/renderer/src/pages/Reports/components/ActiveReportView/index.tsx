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
  selectedCategories,
  selectedType,
  onItemCostHistoryRowsChange,
  onPeriodSummaryCogsChange,
  onStockValuationRowsChange,
  onStockOnHandRowsChange,
  onAvailableCategoriesChange,
  onAvailableTypesChange,
}: ActiveReportViewProps) {
  if (activeView === ReportView.ItemCostHistory) {
    return (
      <ItemCostHistoryView
        fromDate={fromDate}
        toDate={toDate}
        entityId={entityId}
        selectedCategories={selectedCategories}
        selectedType={selectedType}
        onRowsChange={onItemCostHistoryRowsChange}
        onAvailableCategoriesChange={onAvailableCategoriesChange}
        onAvailableTypesChange={onAvailableTypesChange}
      />
    );
  }
  if (activeView === ReportView.PeriodSummary) {
    return (
      <PeriodSummaryView
        fromDate={fromDate}
        toDate={toDate}
        entityId={entityId}
        selectedCategories={selectedCategories}
        selectedType={selectedType}
        onCogsChange={onPeriodSummaryCogsChange}
        onAvailableCategoriesChange={onAvailableCategoriesChange}
        onAvailableTypesChange={onAvailableTypesChange}
      />
    );
  }
  if (activeView === ReportView.StockValuation) {
    return (
      <StockValuationView
        entityId={entityId}
        asOfDate={asOfDate}
        selectedCategories={selectedCategories}
        selectedType={selectedType}
        onRowsChange={onStockValuationRowsChange}
        onAvailableCategoriesChange={onAvailableCategoriesChange}
        onAvailableTypesChange={onAvailableTypesChange}
      />
    );
  }
  return (
    <StockOnHandView
      entityId={entityId}
      asOfDate={asOfDate}
      selectedCategories={selectedCategories}
      selectedType={selectedType}
      onRowsChange={onStockOnHandRowsChange}
      onAvailableCategoriesChange={onAvailableCategoriesChange}
      onAvailableTypesChange={onAvailableTypesChange}
    />
  );
}

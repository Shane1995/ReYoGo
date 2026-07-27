import { useState } from 'react';
import { PageHeader, Button } from '@reyogo/ui';
import { DownloadIcon } from 'lucide-react';
import { useEntities } from '@/Context/EntityContext';
import type { COGSSummary } from '@reyogo/types';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { ReportPicker } from './components/ReportPicker';
import { AsOfDateFilter } from './components/AsOfDateFilter';
import { CategoryFilter } from './components/CategoryFilter';
import { TypeFilter } from './components/TypeFilter';
import { ActiveReportView } from './components/ActiveReportView';
import { exportReport } from './utils/exportReport';
import { exportRequestOf } from './utils/exportRequestOf';
import { DATE_RANGE_REPORT_VIEWS, AS_OF_DATE_REPORT_VIEWS } from './constants';
import { ReportView } from './types';
import type { ItemCostHistoryRow } from './components/ItemCostHistoryView/types';
import type { StockLevelRow } from './hooks/useStockLevelRows/types';

export default function ReportsPage() {
  const { selectedEntityId } = useEntities();
  const [activeView, setActiveView] = useState<ReportView>(ReportView.ItemCostHistory);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [asOfDate, setAsOfDate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [itemCostHistoryRows, setItemCostHistoryRows] = useState<ItemCostHistoryRow[]>([]);
  const [periodSummaryCogs, setPeriodSummaryCogs] = useState<COGSSummary | null>(null);
  const [stockValuationRows, setStockValuationRows] = useState<StockLevelRow[]>([]);
  const [stockOnHandRows, setStockOnHandRows] = useState<StockLevelRow[]>([]);

  const handleViewChange = (view: ReportView) => {
    setActiveView(view);
    setSelectedCategories([]);
    setSelectedType('');
  };

  const handleExport = () => {
    const request = exportRequestOf({
      activeView,
      fromDate,
      toDate,
      asOfDate,
      itemCostHistoryRows,
      periodSummaryCogs,
      stockValuationRows,
      stockOnHandRows,
    });
    if (request) exportReport(request);
  };

  const entityId = selectedEntityId || undefined;
  const showDateRangeFilter = DATE_RANGE_REPORT_VIEWS.includes(activeView);
  const showAsOfDateFilter = AS_OF_DATE_REPORT_VIEWS.includes(activeView);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Reports" description="Capture and export reports on invoiced purchases.">
        <div className="flex items-end justify-between gap-4 print:hidden">
          <div className="flex flex-wrap items-end gap-4">
            <ReportPicker activeView={activeView} setActiveView={handleViewChange} />
            {showDateRangeFilter && (
              <DateRangeFilter
                fromDate={fromDate}
                toDate={toDate}
                onFromChange={setFromDate}
                onToChange={setToDate}
              />
            )}
            {showAsOfDateFilter && <AsOfDateFilter value={asOfDate} onChange={setAsOfDate} />}
            <CategoryFilter
              selected={selectedCategories}
              options={availableCategories}
              onChange={setSelectedCategories}
            />
            <TypeFilter value={selectedType} options={availableTypes} onChange={setSelectedType} />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleExport}>
            <DownloadIcon className="size-3.5 mr-1.5" />
            Export to XLSX
          </Button>
        </div>
      </PageHeader>
      <div className="min-h-0 flex-1 overflow-auto p-4 print:overflow-visible">
        <ActiveReportView
          activeView={activeView}
          fromDate={fromDate}
          toDate={toDate}
          asOfDate={asOfDate}
          entityId={entityId}
          selectedCategories={selectedCategories}
          selectedType={selectedType}
          onItemCostHistoryRowsChange={setItemCostHistoryRows}
          onPeriodSummaryCogsChange={setPeriodSummaryCogs}
          onStockValuationRowsChange={setStockValuationRows}
          onStockOnHandRowsChange={setStockOnHandRows}
          onAvailableCategoriesChange={setAvailableCategories}
          onAvailableTypesChange={setAvailableTypes}
        />
      </div>
    </div>
  );
}

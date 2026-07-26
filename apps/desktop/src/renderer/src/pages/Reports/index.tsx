import { useState } from 'react';
import { PageHeader, Button } from '@reyogo/ui';
import { DownloadIcon } from 'lucide-react';
import { useEntities } from '@/Context/EntityContext';
import type { COGSSummary } from '@reyogo/types';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { ReportPicker } from './components/ReportPicker';
import { ItemCostHistoryView } from './components/ItemCostHistoryView';
import { PeriodSummaryView } from './components/PeriodSummaryView';
import { exportReport } from './utils/exportReport';
import { ReportView } from './types';
import type { ItemCostHistoryRow } from './components/ItemCostHistoryView/types';

export default function ReportsPage() {
  const { selectedEntityId } = useEntities();
  const [activeView, setActiveView] = useState<ReportView>(ReportView.ItemCostHistory);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [itemCostHistoryRows, setItemCostHistoryRows] = useState<ItemCostHistoryRow[]>([]);
  const [periodSummaryCogs, setPeriodSummaryCogs] = useState<COGSSummary | null>(null);

  const handleExport = () => {
    if (activeView === ReportView.ItemCostHistory) {
      exportReport({
        view: ReportView.ItemCostHistory,
        rows: itemCostHistoryRows,
        fromDate,
        toDate,
      });
      return;
    }
    if (periodSummaryCogs) {
      exportReport({ view: ReportView.PeriodSummary, cogs: periodSummaryCogs, fromDate, toDate });
    }
  };

  const entityId = selectedEntityId || undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Reports" description="Capture and export reports on invoiced purchases.">
        <div className="flex items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <ReportPicker activeView={activeView} setActiveView={setActiveView} />
            <DateRangeFilter
              fromDate={fromDate}
              toDate={toDate}
              onFromChange={setFromDate}
              onToChange={setToDate}
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleExport}>
            <DownloadIcon className="size-3.5 mr-1.5" />
            Export to XLSX
          </Button>
        </div>
      </PageHeader>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {activeView === ReportView.ItemCostHistory ? (
          <ItemCostHistoryView
            fromDate={fromDate}
            toDate={toDate}
            entityId={entityId}
            onRowsChange={setItemCostHistoryRows}
          />
        ) : (
          <PeriodSummaryView
            fromDate={fromDate}
            toDate={toDate}
            entityId={entityId}
            onCogsChange={setPeriodSummaryCogs}
          />
        )}
      </div>
    </div>
  );
}

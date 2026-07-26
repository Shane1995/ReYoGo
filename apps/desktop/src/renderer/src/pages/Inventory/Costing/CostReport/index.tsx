import { useState } from 'react';
import { PageHeader, Button } from '@reyogo/ui';
import { DownloadIcon } from 'lucide-react';
import { useEntities } from '@/Context/EntityContext';
import type { COGSSummary } from '@reyogo/types';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { ReportTabs } from './components/ReportTabs';
import { ItemCostHistoryView } from './components/ItemCostHistoryView';
import { PeriodSummaryView } from './components/PeriodSummaryView';
import { useReportExport } from './hooks/useReportExport';
import type { ReportView } from './types';
import type { ItemCostHistoryRow } from './components/ItemCostHistoryView/types';

export default function CostReportPage() {
  const { selectedEntityId } = useEntities();
  const { exportReport } = useReportExport();
  const [activeView, setActiveView] = useState<ReportView>('item-cost-history');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [itemCostHistoryRows, setItemCostHistoryRows] = useState<ItemCostHistoryRow[]>([]);
  const [periodSummaryCogs, setPeriodSummaryCogs] = useState<COGSSummary | null>(null);

  const handleExport = () => {
    if (activeView === 'item-cost-history') {
      exportReport({ view: 'item-cost-history', rows: itemCostHistoryRows, fromDate, toDate });
      return;
    }
    if (periodSummaryCogs) {
      exportReport({ view: 'period-summary', cogs: periodSummaryCogs, fromDate, toDate });
    }
  };

  const entityId = selectedEntityId || undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Cost Report" description="Item cost history and period cost summaries.">
        <div className="flex items-center justify-between gap-4">
          <DateRangeFilter
            fromDate={fromDate}
            toDate={toDate}
            onFromChange={setFromDate}
            onToChange={setToDate}
          />
          <Button type="button" variant="outline" size="sm" onClick={handleExport}>
            <DownloadIcon className="size-3.5 mr-1.5" />
            Export to XLSX
          </Button>
        </div>
      </PageHeader>
      <ReportTabs activeView={activeView} setActiveView={setActiveView} />
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {activeView === 'item-cost-history' ? (
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

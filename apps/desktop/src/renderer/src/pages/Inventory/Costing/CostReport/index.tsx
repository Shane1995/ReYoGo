import { useState } from 'react';
import { PageHeader } from '@reyogo/ui';
import { useEntities } from '@/Context/EntityContext';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { ReportTabs } from './components/ReportTabs';
import { ItemCostHistoryView } from './components/ItemCostHistoryView';
import { PeriodSummaryView } from './components/PeriodSummaryView';
import type { ReportView } from './types';

export default function CostReportPage() {
  const { selectedEntityId } = useEntities();
  const [activeView, setActiveView] = useState<ReportView>('item-cost-history');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Cost Report" description="Item cost history and period cost summaries.">
        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          onFromChange={setFromDate}
          onToChange={setToDate}
        />
      </PageHeader>
      <ReportTabs activeView={activeView} setActiveView={setActiveView} />
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {activeView === 'item-cost-history' ? (
          <ItemCostHistoryView
            fromDate={fromDate}
            toDate={toDate}
            entityId={selectedEntityId || undefined}
          />
        ) : (
          <PeriodSummaryView
            fromDate={fromDate}
            toDate={toDate}
            entityId={selectedEntityId || undefined}
          />
        )}
      </div>
    </div>
  );
}

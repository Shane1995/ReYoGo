import { useEffect, useState } from 'react';
import { PageHeader } from '@reyogo/ui';
import { stockMovementsService } from '@/services/stockMovements';
import { useEntities } from '@/Context/EntityContext';
import type { COGSSummary } from '@reyogo/types';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { CogsContent } from './components/CogsContent';

export default function CostingDashboard() {
  const { selectedEntityId } = useEntities();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [cogs, setCogs] = useState<COGSSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    stockMovementsService
      .getCOGS(fromDate || undefined, toDate || undefined, selectedEntityId || undefined)
      .then(setCogs)
      .catch(() => setCogs(null))
      .finally(() => setLoading(false));
  }, [fromDate, toDate, selectedEntityId]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Costing Dashboard" description="Cost of Goods Used (COGS) summary.">
        <div className="space-y-2.5">
          <DateRangeFilter
            fromDate={fromDate}
            toDate={toDate}
            onFromChange={setFromDate}
            onToChange={setToDate}
          />
        </div>
      </PageHeader>
      <div className="min-h-0 flex-1 overflow-auto p-4 space-y-4">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : (
          <CogsContent cogs={cogs} />
        )}
      </div>
    </div>
  );
}

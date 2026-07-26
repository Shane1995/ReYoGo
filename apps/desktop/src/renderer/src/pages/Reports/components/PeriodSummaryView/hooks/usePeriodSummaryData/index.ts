import { useEffect, useState } from 'react';
import type { COGSSummary } from '@reyogo/types';
import { stockMovementsService } from '@/services/stockMovements';

export function usePeriodSummaryData(
  fromDate: string,
  toDate: string,
  entityId: string | undefined,
) {
  const [cogs, setCogs] = useState<COGSSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    stockMovementsService
      .getCOGS(fromDate || undefined, toDate || undefined, entityId)
      .then((data) => {
        if (!cancelled) setCogs(data);
      })
      .catch(() => {
        if (!cancelled) setCogs(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fromDate, toDate, entityId]);

  return { loading, cogs };
}

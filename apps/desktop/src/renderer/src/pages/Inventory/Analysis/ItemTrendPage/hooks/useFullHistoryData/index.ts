import { useEffect, useState } from 'react';
import type { IStockMovementWithLabel } from '@reyogo/types';
import { stockMovementsService } from '@/services/stockMovements';

export function useFullHistoryData(itemId: string | undefined) {
  const [movements, setMovements] = useState<IStockMovementWithLabel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itemId) return;
    let cancelled = false;
    setLoading(true);
    stockMovementsService
      .getMovementsForItemWithLabels(itemId)
      .then((data) => {
        if (!cancelled) setMovements(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [itemId]);

  return { movements, loading };
}

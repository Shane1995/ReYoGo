import { useEffect, useState } from 'react';
import type { IStocktakeSession } from '@reyogo/types';
import { stocktakeService } from '@/services/stocktake';

export function useCompletedStocktakeSessions(): IStocktakeSession[] {
  const [sessions, setSessions] = useState<IStocktakeSession[]>([]);

  useEffect(() => {
    stocktakeService.getSessions().then((all) => {
      setSessions(all.filter((s) => s.status === 'complete'));
    });
  }, []);

  return sessions;
}

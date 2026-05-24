import { useState, useCallback, useEffect } from 'react';
import { stockMovementsService } from '@/services/stockMovements';
import { currentMonthRange } from '@/utils/dateRange';

export interface DashboardStats {
  totalStockValue: number;
  monthlySpend: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { from, to } = currentMonthRange();
      const [currentStock, wacs, cogs] = await Promise.all([
        stockMovementsService.getCurrentStock(),
        stockMovementsService.getWeightedAvgCosts(),
        stockMovementsService.getCOGS(from, to),
      ]);

      const totalStockValue = Object.entries(currentStock).reduce((sum, [itemId, qty]) => {
        const wac = wacs[itemId] ?? 0;
        return sum + qty * (wac ?? 0);
      }, 0);

      setStats({ totalStockValue, monthlySpend: cogs.total });
    } catch {
      setStats({ totalStockValue: 0, monthlySpend: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

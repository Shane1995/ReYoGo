import { useMemo, useEffect, useState } from 'react';
import type { ItemCostHistory } from '@reyogo/types';
import { stockMovementsService } from '@/services/stockMovements';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import { useAnalysisLines } from '../../../hooks/useAnalysisLines';
import { buildItemGroups } from '../../../utils/buildItemGroups';
import { overallChangePct } from '../../../utils/stats';
import { fmtDate, fmtDateShort } from '../../../utils/format';
import type { Stats } from '../../types';

export function useItemTrendData(itemId: string | undefined) {
  const { lines, loading } = useAnalysisLines();
  const { items } = useInventory();
  const [costHistory, setCostHistory] = useState<ItemCostHistory | null>(null);

  useEffect(() => {
    if (!itemId) return;
    stockMovementsService
      .getItemCostHistory(itemId)
      .then(setCostHistory)
      .catch(() => {});
  }, [itemId]);

  const group = useMemo(() => {
    if (!itemId || !lines.length) return null;
    const groups = buildItemGroups(lines, '', '', items);
    return groups.find((g) => g.itemId === itemId) ?? null;
  }, [lines, itemId, items]);

  const chartData = useMemo(() => {
    if (!group) return [];
    return group.entries.map((e) => ({
      date: fmtDateShort(e.date),
      fullDate: fmtDate(e.date),
      price: e.unitPrice,
      qty: e.quantity,
    }));
  }, [group]);

  const stats = useMemo((): Stats | null => {
    if (!group || !group.entries.length) return null;
    const prices = group.entries.map((e) => e.unitPrice);
    const first = prices[0]!;
    const last = prices[prices.length - 1]!;
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      first,
      last,
      change: overallChangePct(group),
      count: group.entries.length,
      uom: group.uom,
    };
  }, [group]);

  return { loading, group, costHistory, chartData, stats };
}

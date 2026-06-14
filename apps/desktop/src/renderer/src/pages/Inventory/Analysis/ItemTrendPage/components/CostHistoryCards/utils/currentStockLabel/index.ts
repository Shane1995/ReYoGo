import type { ItemCostHistory } from '@reyogo/types';
import { stockQuantityLabel } from '../stockQuantityLabel';

export function currentStockLabel(costHistory: ItemCostHistory, stockSuffix: string): string {
  if (costHistory.totalStock == null) return '—';
  return `${stockQuantityLabel(costHistory.totalStock)}${stockSuffix}`;
}

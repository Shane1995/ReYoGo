import type { ItemCostHistory } from '@reyogo/types';
import { fmt } from '../../../../../utils/format';

export function weightedAvgCostLabel(costHistory: ItemCostHistory, uomSuffix: string): string {
  if (costHistory.weightedAvgCost == null) return '—';
  return `${fmt(costHistory.weightedAvgCost)}${uomSuffix}`;
}

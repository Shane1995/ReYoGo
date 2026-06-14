import { StatCard } from '../StatCard';
import { suffixOf } from './utils/suffixOf';
import { weightedAvgCostLabel } from './utils/weightedAvgCostLabel';
import { currentStockLabel } from './utils/currentStockLabel';
import type { CostHistoryCardsProps } from './types';

export function CostHistoryCards({ costHistory, uom }: CostHistoryCardsProps) {
  const uomSuffix = suffixOf(uom, ' / ');
  const stockSuffix = suffixOf(uom, ' ');
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        label="Weighted avg cost"
        value={weightedAvgCostLabel(costHistory, uomSuffix)}
        muted
      />
      <StatCard label="Current stock" value={currentStockLabel(costHistory, stockSuffix)} muted />
    </div>
  );
}

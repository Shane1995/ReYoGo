import { PriceStatCards } from '../PriceStatCards';
import { CostHistoryCards } from '../CostHistoryCards';
import { uomOf } from './utils/uomOf';
import type { StatsAndCostSectionProps } from './types';

export function StatsAndCostSection({ stats, costHistory }: StatsAndCostSectionProps) {
  return (
    <>
      {stats && <PriceStatCards stats={stats} />}
      {costHistory && <CostHistoryCards costHistory={costHistory} uom={uomOf(stats)} />}
    </>
  );
}

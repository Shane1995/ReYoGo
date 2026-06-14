import type { ItemCostHistory } from '@reyogo/types';
import type { Stats } from '../../types';

export type StatsAndCostSectionProps = {
  stats: Stats | null;
  costHistory: ItemCostHistory | null;
};

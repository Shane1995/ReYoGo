import type { ItemGroup } from '../../../types';
import type { Stats } from '../../types';

export type ItemTrendHeaderProps = {
  group: ItemGroup;
  stats: Stats | null;
  onBack: () => void;
};

import type { ItemCostHistoryRowGroup } from '../../utils/groupRowsByItem';

export type ItemGroupRowProps = {
  group: ItemCostHistoryRowGroup;
  index: number;
  isExpanded: boolean;
  onToggle: (itemId: string) => void;
};

import type { ItemOption } from '../../types';

export type OptionRowProps = {
  item: ItemOption;
  isHighlighted: boolean;
  onSelect: (item: ItemOption) => void;
};

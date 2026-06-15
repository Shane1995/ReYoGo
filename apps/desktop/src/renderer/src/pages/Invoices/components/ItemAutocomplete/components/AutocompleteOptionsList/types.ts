import type { ItemOption } from '../../types';

export type AutocompleteOptionsListProps = {
  items: ItemOption[];
  highlightIndex: number;
  onSelect: (item: ItemOption) => void;
};

import type { FilterOption } from '../../../types';

export type MultiSelectOptionProps = {
  opt: FilterOption;
  selected: string[];
  onToggle: (value: string) => void;
};

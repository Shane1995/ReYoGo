import type { FilterOption } from '../../../types';

export type SingleSelectOptionProps = {
  opt: FilterOption;
  selected: string;
  onSelect: (value: string) => void;
};

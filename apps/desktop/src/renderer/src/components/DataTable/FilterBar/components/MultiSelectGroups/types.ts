import type { FilterOption } from '../../../types';
import type { FilterGroup } from '../../types';

export type MultiSelectGroupsProps = {
  groups: FilterGroup[];
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
};

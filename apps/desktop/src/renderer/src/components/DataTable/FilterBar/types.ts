import type { FilterField, FilterOption, FilterValues } from '../types';

export type FilterBarProps = {
  filters: FilterField[];
  values: FilterValues;
  onChange: (key: string, value: string | string[]) => void;
  onClearAll: () => void;
};

export type FilterGroup = {
  label: string;
  items: FilterOption[];
};

import type { FilterField, FilterValues } from '../../types';

export type FilterBarSectionProps = {
  hideFilters: boolean;
  filters: FilterField[];
  filterValues: FilterValues;
  onFilterChange: ((key: string, value: string | string[]) => void) | undefined;
  onClearFilters: (() => void) | undefined;
};

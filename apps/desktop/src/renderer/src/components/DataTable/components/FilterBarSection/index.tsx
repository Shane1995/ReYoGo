import { FilterBar } from '../../FilterBar';
import { shouldRenderFilters } from '../../utils/shouldRenderFilters';
import type { FilterBarSectionProps } from './types';

export function FilterBarSection({
  hideFilters,
  filters,
  filterValues,
  onFilterChange,
  onClearFilters,
}: FilterBarSectionProps) {
  if (!shouldRenderFilters(hideFilters, filters.length)) return null;
  if (!onFilterChange || !onClearFilters) return null;
  return (
    <FilterBar
      filters={filters}
      values={filterValues}
      onChange={onFilterChange}
      onClearAll={onClearFilters}
    />
  );
}

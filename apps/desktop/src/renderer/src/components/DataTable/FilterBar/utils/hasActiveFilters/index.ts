import type { FilterValues } from '../../../types';

export function hasActiveFilters(values: FilterValues): boolean {
  return Object.values(values).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value),
  );
}

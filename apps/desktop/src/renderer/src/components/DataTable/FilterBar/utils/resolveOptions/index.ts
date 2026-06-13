import type { FilterField, FilterOption, FilterValues } from '../../../types';

export function resolveOptions(field: FilterField, values: FilterValues): FilterOption[] {
  if (!field.options) return [];
  return typeof field.options === 'function' ? field.options(values) : field.options;
}

import type { FilterValues } from '../../../types';

export function arrayValueOf(values: FilterValues, key: string): string[] {
  const value = values[key];
  return Array.isArray(value) ? value : [];
}

import type { FilterValues } from '../../../types';

export function stringValueOf(values: FilterValues, key: string): string {
  const value = values[key];
  if (typeof value !== 'string') return '';
  return value;
}

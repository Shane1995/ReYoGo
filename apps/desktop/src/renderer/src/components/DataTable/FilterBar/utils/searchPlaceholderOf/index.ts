import type { FilterField } from '../../../types';

export function searchPlaceholderOf(field: FilterField): string {
  if (field.placeholder) return field.placeholder;
  return `Search ${field.label}…`;
}

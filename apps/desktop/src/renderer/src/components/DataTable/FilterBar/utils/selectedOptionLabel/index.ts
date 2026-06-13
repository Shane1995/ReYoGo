import type { FilterOption } from '../../../types';

export function selectedOptionLabel(
  selected: string,
  options: FilterOption[],
  fallback: string,
): string {
  if (!selected) return fallback;
  const match = options.find((opt) => opt.value === selected);
  if (!match) return fallback;
  return match.label;
}

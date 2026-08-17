import type { UnitOfMeasure } from '@reyogo/types';

export function isDuplicateUnitName(
  units: UnitOfMeasure[],
  name: string,
  excludeId?: string,
): boolean {
  const normalized = name.trim().toLowerCase();
  return units.some((u) => u.id !== excludeId && u.name.trim().toLowerCase() === normalized);
}

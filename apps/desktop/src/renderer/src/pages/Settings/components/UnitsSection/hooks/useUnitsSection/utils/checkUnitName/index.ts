import { toast } from 'sonner';
import type { UnitWithUsage } from '../../../../types';
import { isDuplicateUnitName } from '../../../../utils/isDuplicateUnitName';
import type { UnitNameCheck } from './types';

export function checkUnitName(
  units: UnitWithUsage[],
  name: string,
  excludeId?: string,
): UnitNameCheck {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false };
  if (isDuplicateUnitName(units, trimmed, excludeId)) {
    toast.error(`A unit named "${trimmed}" already exists`);
    return { ok: false };
  }
  return { ok: true, name: trimmed };
}

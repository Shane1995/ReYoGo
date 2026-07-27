import { VatMode } from '@reyogo/types';

export function totalColumnLabelOf(vatMode: VatMode): string {
  if (vatMode === VatMode.Inclusive) return 'Total (incl.)';
  return 'Total (excl.)';
}

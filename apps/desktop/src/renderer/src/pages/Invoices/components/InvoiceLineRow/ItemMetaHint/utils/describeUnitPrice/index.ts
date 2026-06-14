import { VatMode } from '@reyogo/types';
import type { getProcessLineComputed } from '../../../../../types';
import { formatMoney } from '../../../../../utils/formatMoney';

export function describeUnitPrice(
  vatMode: VatMode,
  computed: ReturnType<typeof getProcessLineComputed>,
): string | null {
  if (computed.netUnitPrice <= 0) return null;
  const price = vatMode === VatMode.Inclusive ? computed.grossUnitPrice : computed.netUnitPrice;
  return `${formatMoney(price)} / unit`;
}

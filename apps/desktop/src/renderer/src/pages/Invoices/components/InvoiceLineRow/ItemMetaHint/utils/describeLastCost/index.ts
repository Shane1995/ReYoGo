import { formatMoney } from '../../../../../utils/formatMoney';

export function describeLastCost(lastUnitCostInclVat: number | undefined): string | null {
  if (lastUnitCostInclVat == null) return null;
  return `Last ${formatMoney(lastUnitCostInclVat)} incl. VAT`;
}

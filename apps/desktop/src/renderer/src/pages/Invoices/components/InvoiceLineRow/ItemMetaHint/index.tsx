import { VatMode } from '@reyogo/types';
import type { getProcessLineComputed } from '../../../types';
import { formatMoney } from '../../../utils/formatMoney';

export type ItemMeta = {
  categoryName?: string;
  typeLabel?: string;
  unitOfMeasure?: string | null;
  lastUnitCostInclVat?: number;
};

function describeUnitPrice(
  vatMode: VatMode,
  computed: ReturnType<typeof getProcessLineComputed>,
): string | null {
  if (computed.netUnitPrice <= 0) return null;
  const price = vatMode === VatMode.Inclusive ? computed.grossUnitPrice : computed.netUnitPrice;
  return `${formatMoney(price)} / unit`;
}

function describeLastCost(lastUnitCostInclVat: number | undefined): string | null {
  if (lastUnitCostInclVat == null) return null;
  return `Last ${formatMoney(lastUnitCostInclVat)} incl. VAT`;
}

export function ItemMetaHint({
  itemMeta,
  vatMode,
  computed,
}: {
  itemMeta: ItemMeta;
  vatMode: VatMode;
  computed: ReturnType<typeof getProcessLineComputed>;
}) {
  const parts = [
    itemMeta.categoryName,
    itemMeta.typeLabel,
    itemMeta.unitOfMeasure,
    describeUnitPrice(vatMode, computed),
    describeLastCost(itemMeta.lastUnitCostInclVat),
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <p className="mt-0.5 text-[11px] text-muted-foreground/60 truncate tracking-wide">
      {parts.join(' · ')}
    </p>
  );
}

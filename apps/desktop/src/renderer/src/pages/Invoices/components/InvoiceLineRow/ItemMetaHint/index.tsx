import { describeUnitPrice } from './utils/describeUnitPrice';
import { describeLastCost } from './utils/describeLastCost';
import type { ItemMetaHintProps } from './types';

export type { ItemMeta } from './types';

export function ItemMetaHint({ itemMeta, vatMode, computed }: ItemMetaHintProps) {
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

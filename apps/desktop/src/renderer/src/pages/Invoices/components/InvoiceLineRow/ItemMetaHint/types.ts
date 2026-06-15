import { VatMode } from '@reyogo/types';
import type { getProcessLineComputed } from '../../../types';

export type ItemMeta = {
  categoryName?: string;
  typeLabel?: string;
  unitOfMeasure?: string | null;
  lastUnitCostInclVat?: number;
};

export type ItemMetaHintProps = {
  itemMeta: ItemMeta;
  vatMode: VatMode;
  computed: ReturnType<typeof getProcessLineComputed>;
};

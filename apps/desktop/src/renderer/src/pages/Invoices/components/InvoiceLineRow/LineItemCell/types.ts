import { VatMode } from '@reyogo/types';
import type { getProcessLineComputed } from '../../../types';
import type { ItemOption } from '../../ItemAutocomplete';
import type { ItemMeta } from '../ItemMetaHint';

export type LineItemCellProps = {
  lineId: string;
  itemId: string;
  sortedItems: ItemOption[];
  entityId: string;
  isLast: boolean;
  itemMeta: ItemMeta | undefined;
  vatMode: VatMode;
  computed: ReturnType<typeof getProcessLineComputed>;
  onChange: (itemId: string) => void;
  onAddLine: (focusField?: string) => void;
};

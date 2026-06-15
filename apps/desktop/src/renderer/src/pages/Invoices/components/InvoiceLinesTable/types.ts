import type { VatMode } from '@reyogo/types';
import type { ProcessReceiptLine } from '../../types';
import type { ItemOption } from '../ItemAutocomplete';
import type { ItemMeta } from '../InvoiceLineRow/ItemMetaHint';

export type InvoiceLinesTableProps = {
  lines: ProcessReceiptLine[];
  vatMode: VatMode;
  vatRate: number;
  expandedLineIds: Set<string>;
  sortedItems: ItemOption[];
  entityId: string;
  itemMetaMap: Map<string, ItemMeta>;
  onToggleExpand: (lineId: string) => void;
  onUpdateLine: (lineId: string, updates: Partial<ProcessReceiptLine>) => void;
  onRemoveLine: (lineId: string) => void;
  onAddLine: (focusField?: string) => void;
};

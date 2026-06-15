import { VatMode } from '@reyogo/types';
import type { ProcessReceiptLine } from '../../types';
import type { ItemOption } from '../ItemAutocomplete';
import type { ItemMeta } from './ItemMetaHint';

export type InvoiceLineRowProps = {
  line: ProcessReceiptLine;
  index: number;
  vatMode: VatMode;
  vatRate: number;
  isExpanded: boolean;
  isLast: boolean;
  sortedItems: ItemOption[];
  entityId: string;
  itemMeta: ItemMeta | undefined;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<ProcessReceiptLine>) => void;
  onRemove: () => void;
  onAddLine: (focusField?: string) => void;
  onNavigateNext: (field: string) => void;
  onNavigatePrev: (field: string) => void;
  onNavigateToNextRowItem: () => void;
};

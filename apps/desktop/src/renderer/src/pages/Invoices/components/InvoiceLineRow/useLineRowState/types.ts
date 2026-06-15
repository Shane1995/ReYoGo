import { VatMode } from '@reyogo/types';
import type { ProcessReceiptLine } from '../../../types';

export type UseLineRowStateParams = {
  line: ProcessReceiptLine;
  index: number;
  isLast: boolean;
  isExpanded: boolean;
  vatMode: VatMode;
  vatRate: number;
  onRemove: () => void;
  onAddLine: (focusField?: string) => void;
  onNavigateNext: (field: string) => void;
  onNavigatePrev: (field: string) => void;
  onNavigateToNextRowItem: () => void;
};

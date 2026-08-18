import type { CategoryBucket } from '@/pages/Reports/utils/groupByCategory/types';
import type { ISaveStocktakeLinePayload } from '@reyogo/types';
import type { CountSheetRow } from '../../types';
import type { StockTakeSummary } from '../../utils/stockTakeSummaryOf/types';

export type ActiveSessionPanelProps = {
  buckets: CategoryBucket<CountSheetRow>[];
  readOnly: boolean;
  onQtyChange: (itemId: string, qty: number | null) => void;
  summary: StockTakeSummary;
  search: string;
  onSearchChange: (search: string) => void;
  saving: boolean;
  completing: boolean;
  lines: ISaveStocktakeLinePayload[];
  onSaveDraft: (lines: ISaveStocktakeLinePayload[]) => void;
  onCompleteClick: () => void;
};

import type { CategoryBucket } from '@/pages/Reports/utils/groupByCategory/types';
import type { CountSheetRow } from '../../types';

export type CountSheetTableProps = {
  buckets: CategoryBucket<CountSheetRow>[];
  readOnly: boolean;
  onQtyChange: (itemId: string, qty: number | null) => void;
};

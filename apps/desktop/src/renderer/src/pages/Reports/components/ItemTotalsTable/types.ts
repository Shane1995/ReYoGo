import type { ItemTotalRow } from '../../utils/itemTotalRowsOf/types';

export type ItemTotalsTableProps = {
  rows: ItemTotalRow[];
  grandTotal: number;
  emptyMessage: string;
};

import type { StockOnHandSortKey } from '../../types';

export type SortSelectProps = {
  value: StockOnHandSortKey;
  onChange: (value: StockOnHandSortKey) => void;
};

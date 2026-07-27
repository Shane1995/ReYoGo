import type { StockSortKey } from '../../hooks/useStockLevelRows/types';

export type StockSortSelectProps = {
  value: StockSortKey;
  onChange: (value: StockSortKey) => void;
};

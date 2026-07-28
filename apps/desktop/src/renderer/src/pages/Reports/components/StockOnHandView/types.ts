import type { StockLevelRow } from '../../hooks/useStockLevelRows/types';

export type StockOnHandViewProps = {
  entityId: string | undefined;
  asOfDate: string;
  selectedCategories: string[];
  selectedType: string;
  onRowsChange: (rows: StockLevelRow[]) => void;
  onAvailableCategoriesChange: (categories: string[]) => void;
  onAvailableTypesChange: (types: string[]) => void;
};

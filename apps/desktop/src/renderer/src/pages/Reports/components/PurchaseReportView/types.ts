import type { ItemTotalRow } from '../../utils/itemTotalRowsOf/types';

export type PurchaseReportViewProps = {
  fromDate: string;
  toDate: string;
  entityId: string | undefined;
  selectedCategories: string[];
  selectedType: string;
  onRowsChange: (rows: ItemTotalRow[]) => void;
  onAvailableCategoriesChange: (categories: string[]) => void;
  onAvailableTypesChange: (types: string[]) => void;
};

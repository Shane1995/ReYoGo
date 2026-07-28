export type ItemCostHistoryRow = {
  itemId: string;
  itemName: string;
  uom?: string;
  categoryName?: string;
  invoiceId: string;
  date: Date;
  quantity: number;
  unitCostExclVat: number;
  unitCostInclVat: number;
  isVatable: boolean;
  pctChange: number | null;
  flagged: boolean;
};

export type ItemCostHistoryViewProps = {
  fromDate: string;
  toDate: string;
  entityId: string | undefined;
  selectedCategories: string[];
  selectedType: string;
  onRowsChange: (rows: ItemCostHistoryRow[]) => void;
  onAvailableCategoriesChange: (categories: string[]) => void;
  onAvailableTypesChange: (types: string[]) => void;
};

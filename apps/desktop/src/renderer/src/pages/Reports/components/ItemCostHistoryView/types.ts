export type ItemCostHistoryRow = {
  itemId: string;
  itemName: string;
  uom?: string;
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
  onRowsChange: (rows: ItemCostHistoryRow[]) => void;
};

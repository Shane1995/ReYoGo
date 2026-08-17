export type CountSheetRow = {
  itemId: string;
  itemName: string;
  uom?: string;
  lastCost: number | null;
  countedQty: number | null;
};

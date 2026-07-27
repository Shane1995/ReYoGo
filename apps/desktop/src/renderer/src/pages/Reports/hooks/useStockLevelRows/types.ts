export type StockLevelRow = {
  itemId: string;
  itemName: string;
  uom?: string;
  categoryName?: string;
  categoryType: string;
  quantity: number;
  avgCost: number;
  totalValue: number;
};

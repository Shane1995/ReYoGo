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

export enum StockSortKey {
  Name = 'name',
  Quantity = 'quantity',
  TotalValue = 'totalValue',
}

export enum StockCostSource {
  WeightedAverage = 'wac',
  LastCost = 'lastCost',
}

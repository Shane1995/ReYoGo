export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT';
export type StockMovementSource = 'invoice' | 'usage' | 'adjustment';

export interface IStockMovement {
  id: string;
  itemId: string;
  itemNameSnapshot: string;
  type: StockMovementType;
  quantity: number;
  source: StockMovementSource;
  referenceId?: string | null;
  costAtTime?: number | null;
  cogsAmount?: number | null;
  createdAt: Date;
}

export interface IItemCostHistory {
  itemId: string;
  weightedAvgCost: number | null;
  totalStock: number;
  movements: Array<{
    id: string;
    type: StockMovementType;
    quantity: number;
    costAtTime: number | null;
    cogsAmount: number | null;
    createdAt: Date;
  }>;
}

export interface ICOGSSummary {
  total: number;
  byCategory: Array<{
    categoryId: string | null;
    categoryName: string | null;
    total: number;
  }>;
}

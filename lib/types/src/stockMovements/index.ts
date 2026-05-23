export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'WASTE' | 'RETURN';
export type ReferenceType = 'invoice' | 'manual' | 'adjustment';

export interface IStockMovement {
  id: string;
  inventoryItemId: string;
  movementType: StockMovementType;
  qty: number;
  unitCostAtTime: number | null;
  totalCost: number | null;
  weightedAvgCostAfter: number | null;
  stockQtyAfter: number;
  referenceType: ReferenceType | null;
  referenceId: string | null;
  notes: string | null;
  occurredAt: Date;
  createdAt: Date;
}

export type IStockMovementSummary = Pick<
  IStockMovement,
  | 'id'
  | 'movementType'
  | 'qty'
  | 'unitCostAtTime'
  | 'totalCost'
  | 'weightedAvgCostAfter'
  | 'stockQtyAfter'
  | 'occurredAt'
  | 'createdAt'
>;

export interface IItemCostHistory {
  itemId: string;
  weightedAvgCost: number | null;
  totalStock: number;
  movements: IStockMovementSummary[];
}

export interface ICOGSSummary {
  total: number;
  byCategory: Array<{
    categoryId: string | null;
    categoryName: string | null;
    total: number;
  }>;
}

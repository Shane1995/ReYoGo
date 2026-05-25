export enum MovementType {
  In = 'IN',
  Out = 'OUT',
  Adjustment = 'ADJUSTMENT',
  Waste = 'WASTE',
  Return = 'RETURN',
}

export type ReferenceType = 'invoice' | 'manual' | 'adjustment';

export interface StockMovement {
  id: string;
  inventoryItemId: string;
  movementType: MovementType;
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

export type StockMovementSummary = Pick<
  StockMovement,
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

export interface ItemCostHistory {
  itemId: string;
  weightedAvgCost: number | null;
  totalStock: number;
  movements: StockMovementSummary[];
}

export interface COGSSummary {
  total: number;
  byCategory: Array<{
    categoryId: string | null;
    categoryName: string | null;
    total: number;
  }>;
}

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'WASTE' | 'RETURN';
export type IStockMovement = StockMovement;
export type IStockMovementSummary = StockMovementSummary;
export type IItemCostHistory = ItemCostHistory;
export type ICOGSSummary = COGSSummary;

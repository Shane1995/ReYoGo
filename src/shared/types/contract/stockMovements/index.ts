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
  createdAt: Date;
}

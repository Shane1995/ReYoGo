export interface CostingSnapshot {
  inventoryItemId: string;
  snapshotDate: Date;
  weightedAvgCost: number | null;
  stockQtyOnHand: number;
  stockValue: number | null;
}

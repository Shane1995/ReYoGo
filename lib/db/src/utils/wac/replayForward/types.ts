import type { MovementType } from '@reyogo/types';

export type ReplayMovementInput = {
  id: string;
  movementType: MovementType;
  qty: number;
  unitCostAtTime: number | null;
};

export type ReplayMovementResult = {
  id: string;
  stockQtyAfter: number;
  weightedAvgCostAfter: number | null;
};

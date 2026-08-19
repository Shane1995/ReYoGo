import { MovementType } from '@reyogo/types';
import { calculateWAC } from '..';
import type { ReplayMovementInput, ReplayMovementResult } from './types';

export function replayWacForward(
  basePrevQty: number,
  basePrevWac: number | null,
  movements: ReplayMovementInput[],
): ReplayMovementResult[] {
  let prevQty = basePrevQty;
  let prevWac = basePrevWac;
  const results: ReplayMovementResult[] = [];

  for (const movement of movements) {
    const stockQtyAfter = prevQty + movement.qty;
    const weightedAvgCostAfter =
      movement.movementType === MovementType.In
        ? calculateWAC(prevQty, prevWac, movement.qty, movement.unitCostAtTime ?? 0)
        : prevWac;

    results.push({ id: movement.id, stockQtyAfter, weightedAvgCostAfter });
    prevQty = stockQtyAfter;
    prevWac = weightedAvgCostAfter;
  }

  return results;
}

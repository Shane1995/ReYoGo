import { describe, it, expect } from 'vitest';
import { MovementType } from '@reyogo/types';
import { replayWacForward } from '.';

describe('replayWacForward', () => {
  it('returns an empty array when there are no movements to replay', () => {
    expect(replayWacForward(0, null, [])).toEqual([]);
  });

  it('sets WAC to the unit cost for an IN movement from a zero/null base', () => {
    const result = replayWacForward(0, null, [
      { id: 'm1', movementType: MovementType.In, qty: 10, unitCostAtTime: 5 },
    ]);
    expect(result).toEqual([{ id: 'm1', stockQtyAfter: 10, weightedAvgCostAfter: 5 }]);
  });

  it('computes a weighted average for an IN movement against a nonzero base', () => {
    const result = replayWacForward(10, 5, [
      { id: 'm1', movementType: MovementType.In, qty: 10, unitCostAtTime: 7 },
    ]);
    expect(result).toEqual([{ id: 'm1', stockQtyAfter: 20, weightedAvgCostAfter: 6 }]);
  });

  it('carries WAC forward unchanged for a RETURN movement and reduces qty', () => {
    const result = replayWacForward(10, 5, [
      { id: 'm1', movementType: MovementType.Return, qty: -4, unitCostAtTime: null },
    ]);
    expect(result).toEqual([{ id: 'm1', stockQtyAfter: 6, weightedAvgCostAfter: 5 }]);
  });

  it('carries WAC forward unchanged for an OUT movement and reduces qty', () => {
    const result = replayWacForward(10, 5, [
      { id: 'm1', movementType: MovementType.Out, qty: -3, unitCostAtTime: null },
    ]);
    expect(result).toEqual([{ id: 'm1', stockQtyAfter: 7, weightedAvgCostAfter: 5 }]);
  });

  it('carries WAC forward unchanged for an ADJUSTMENT movement and applies the signed delta', () => {
    const result = replayWacForward(10, 5, [
      { id: 'm1', movementType: MovementType.Adjustment, qty: 2, unitCostAtTime: null },
    ]);
    expect(result).toEqual([{ id: 'm1', stockQtyAfter: 12, weightedAvgCostAfter: 5 }]);
  });

  it('chains each movement off the previously computed result, not the original base', () => {
    const result = replayWacForward(0, null, [
      { id: 'm1', movementType: MovementType.In, qty: 10, unitCostAtTime: 4 },
      { id: 'm2', movementType: MovementType.Return, qty: -2, unitCostAtTime: null },
      { id: 'm3', movementType: MovementType.In, qty: 10, unitCostAtTime: 8 },
    ]);
    expect(result).toEqual([
      { id: 'm1', stockQtyAfter: 10, weightedAvgCostAfter: 4 },
      { id: 'm2', stockQtyAfter: 8, weightedAvgCostAfter: 4 },
      { id: 'm3', stockQtyAfter: 18, weightedAvgCostAfter: 6.2222 },
    ]);
  });

  it("can produce a negative stockQtyAfter without throwing — negative-stock detection is the caller's job", () => {
    const result = replayWacForward(2, 5, [
      { id: 'm1', movementType: MovementType.Return, qty: -5, unitCostAtTime: null },
    ]);
    expect(result).toEqual([{ id: 'm1', stockQtyAfter: -3, weightedAvgCostAfter: 5 }]);
  });
});

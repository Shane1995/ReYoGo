export type ItemCostEntry = {
  lastUnitCost: number | null;
  lastCostDate: Date | null;
  weightedAvgCost: number | null;
  lastUnitCostInclVat: number | null;
};

export type WacRecord = Record<string, number | null>;

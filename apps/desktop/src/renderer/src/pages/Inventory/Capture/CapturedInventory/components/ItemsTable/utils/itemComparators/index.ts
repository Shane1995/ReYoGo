import type { FlatItem } from '../../types';

function compareNullableAsc(a: number | null | undefined, b: number | null | undefined): number {
  if (a == null) return b == null ? 0 : 1;
  if (b == null) return -1;
  return a - b;
}

export const sortByName = (a: FlatItem, b: FlatItem) => a.name.localeCompare(b.name);

export const sortByCategory = (a: FlatItem, b: FlatItem) =>
  a.categoryName.localeCompare(b.categoryName);

export const sortByStock = (a: FlatItem, b: FlatItem) =>
  compareNullableAsc(a.currentStock, b.currentStock);

export const sortByLastCost = (a: FlatItem, b: FlatItem) =>
  compareNullableAsc(a.lastCostPerUnitInclVat, b.lastCostPerUnitInclVat);

export const sortByAvgCost = (a: FlatItem, b: FlatItem) =>
  compareNullableAsc(a.weightedAvgCost, b.weightedAvgCost);

import type { IUnitOfMeasure } from "@shared/types/contract/setup";

export type Step = "welcome" | "good-types" | "units" | "categories" | "items" | "done";

export const STEP_LABELS: Record<Step, string> = {
  welcome: "Welcome",
  "good-types": "Types",
  units: "Units",
  categories: "Categories",
  items: "Items",
  done: "Done",
};

export const DEFAULT_GOOD_TYPES = ["food", "drink", "non-perishable"];

export const DEFAULT_UNITS: IUnitOfMeasure[] = [
  { id: crypto.randomUUID(), name: "litres" },
  { id: crypto.randomUUID(), name: "kgs" },
  { id: crypto.randomUUID(), name: "unit" },
];

export type PendingCategory = { id: string; name: string; type: string };
export type PendingItem = { id: string; name: string; categoryId: string; unitId: string };

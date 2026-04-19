import type { PendingCategory, PendingItem } from "./types";

export function createEmptyCategory(defaultType: string): PendingCategory {
  return { id: crypto.randomUUID(), name: "", type: defaultType };
}

export function createEmptyItem(): PendingItem {
  return { id: crypto.randomUUID(), name: "", categoryId: "", unitId: "" };
}

export const INVENTORY_TYPES = ['food', 'beverage', 'non-food'] as const;
export type InventoryType = (typeof INVENTORY_TYPES)[number];

export interface IInventoryCategory {
  id: string;
  name: string;
  type: InventoryType;
}

export interface IInventoryItem {
  id: string;
  name: string;
  categoryId: string;
  type: InventoryType;
  unitOfMeasure?: string;
  yieldFactor?: number;
  parLevel?: number | null;
  reorderPoint?: number | null;
  reorderQty?: number | null;
}

export interface IInventorySubmitPayload {
  addedCategories: IInventoryCategory[];
  addedItems: IInventoryItem[];
  updatedCategories: IInventoryCategory[];
  updatedItems: IInventoryItem[];
  deletedCategoryIds: string[];
  deletedItemIds: string[];
}

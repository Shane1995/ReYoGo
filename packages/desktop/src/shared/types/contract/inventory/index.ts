export type InventoryType = string;

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
}

export interface IInventorySubmitPayload {
  addedCategories: IInventoryCategory[];
  addedItems: IInventoryItem[];
  updatedCategories: IInventoryCategory[];
  updatedItems: IInventoryItem[];
  deletedCategoryIds: string[];
  deletedItemIds: string[];
}

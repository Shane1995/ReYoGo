export type InventoryType = 'food' | 'drink' | 'non-perishable';
export type UnitOfMeasure = 'litres' | 'kgs' | 'unit';

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
  unitOfMeasure?: UnitOfMeasure;
}

export interface IInventorySubmitPayload {
  addedCategories: IInventoryCategory[];
  addedItems: IInventoryItem[];
  updatedCategories: IInventoryCategory[];
  updatedItems: IInventoryItem[];
  deletedCategoryIds: string[];
  deletedItemIds: string[];
}

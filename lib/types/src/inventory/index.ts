export enum InventoryType {
  Food = 'food',
  Beverage = 'beverage',
  NonFood = 'non-food',
}

export const INVENTORY_TYPES = Object.values(InventoryType);

export interface Category {
  id: string;
  name: string;
  type: InventoryType;
}

export interface UnitOfMeasure {
  id: string;
  name: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  categoryId: string;
  unitOfMeasureId: string | null;
  sku: string | null;
  currentStockQty: number;
  currentWeightedAvgCost: number | null;
  reorderPoint: number | null;
  reorderQty: number | null;
}

export type InventoryItemInput = Omit<InventoryItem, 'currentStockQty' | 'currentWeightedAvgCost'>;

export interface InventorySubmitPayload {
  addedCategories: Category[];
  addedItems: InventoryItemInput[];
  updatedCategories: Category[];
  updatedItems: InventoryItemInput[];
  deletedCategoryIds: string[];
  deletedItemIds: string[];
}

export type IInventoryCategory = Category;
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
export type IInventorySubmitPayload = InventorySubmitPayload;
export type IUnitOfMeasure = UnitOfMeasure;

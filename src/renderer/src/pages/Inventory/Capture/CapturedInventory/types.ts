export type TypeValue = string;

export type InventoryCategory = {
  id: string;
  name: string;
  type: TypeValue;
};

export type InventoryItem = {
  id: string;
  name: string;
  categoryId: string;
  type: TypeValue;
  unitOfMeasure?: string;
};

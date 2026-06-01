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
  unitOfMeasureId?: string | null;
  type: TypeValue;
  unitOfMeasure?: string;
};

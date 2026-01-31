export const TYPE_VALUES = ["food", "drink", "non-perishable"] as const;
export type TypeValue = (typeof TYPE_VALUES)[number];

export const TYPE_LABELS: Record<TypeValue, string> = {
  food: "Foods",
  drink: "Drinks",
  "non-perishable": "Non-perishable",
};

export type InventoryCategory = {
  id: string;
  name: string;
  type: TypeValue;
};

export const UNIT_OPTIONS = ["litres", "kgs", "unit"] as const;
export type UnitOfMeasure = (typeof UNIT_OPTIONS)[number];

export type InventoryItem = {
  id: string;
  name: string;
  categoryId: string;
  type: TypeValue;
  unitOfMeasure?: UnitOfMeasure;
};

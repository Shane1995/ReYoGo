export type CategoryType = "food" | "drink" | "non-perishable";

export type InitialCategory = {
  name: string;
  type: CategoryType;
};

export const INITIAL_CATEGORIES: InitialCategory[] = [
  { name: "Pantry", type: "food" },
  { name: "Dairy", type: "food" },
  { name: "Produce", type: "food" },
  { name: "Frozen", type: "food" },
  { name: "Bakery", type: "food" },
];

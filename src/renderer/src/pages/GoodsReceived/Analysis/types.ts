export type ItemEntry = {
  invoiceId: string;
  date: Date;
  quantity: number;
  unitPrice: number;
  uom?: string;
};

export type ItemGroup = {
  itemId: string;
  name: string;
  uom?: string;
  categoryType: string;
  categoryName?: string;
  entries: ItemEntry[];
};

export type Metric = "price" | "change";

export const TYPE_ORDER = ["food", "drink", "non-perishable"];

export const TYPE_LABELS: Record<string, string> = {
  food: "Foods",
  drink: "Drinks",
  "non-perishable": "Non-perishable",
};

export function typeLabel(t: string) {
  return TYPE_LABELS[t] ?? t.charAt(0).toUpperCase() + t.slice(1);
}

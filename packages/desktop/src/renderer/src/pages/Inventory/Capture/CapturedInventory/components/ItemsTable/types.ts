import type { InventoryCategory, InventoryItem } from "../../types";

export type ItemCost = { price: number; uom?: string };

export type FlatItem = {
  id: string;
  name: string;
  type: string;
  categoryId: string;
  categoryName: string;
  unitOfMeasure?: string;
  lastCostPerUnit?: number;
  lastCostUom?: string;
  currentStock?: number;
  weightedAvgCost?: number | null;
};

export type ItemsTableProps = {
  items: InventoryItem[];
  categories: InventoryCategory[];
  units: string[];
  goodTypes: string[];
  costMap: Map<string, ItemCost>;
  stockMap: Map<string, number>;
  weightedAvgMap: Map<string, number | null>;
  onUpdate: (id: string, values: Omit<InventoryItem, "id">) => void;
  onDelete: (id: string) => void;
  onViewInsights: (id: string) => void;
};

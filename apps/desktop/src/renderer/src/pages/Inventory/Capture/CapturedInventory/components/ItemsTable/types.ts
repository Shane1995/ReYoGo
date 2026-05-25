import type { InventoryCategory, InventoryItem } from '../../types';
import type { ItemCostEntry } from '../../hooks/useInventoryCosts';

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
  costMap: Map<string, ItemCostEntry>;
  stockMap: Map<string, number>;
  onUpdate: (id: string, values: Omit<InventoryItem, 'id'>) => void;
  onDelete: (id: string) => void;
  onViewInsights: (id: string) => void;
};

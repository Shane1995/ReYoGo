import type { InventoryCategory, InventoryItem } from '../../types';

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
  filteredItems: FlatItem[];
  allTypes: string[];
  categories: InventoryCategory[];
  units: string[];
  onUpdate: (id: string, values: Omit<InventoryItem, 'id'>) => void;
  onDelete: (id: string) => void;
  onViewInsights: (id: string) => void;
};

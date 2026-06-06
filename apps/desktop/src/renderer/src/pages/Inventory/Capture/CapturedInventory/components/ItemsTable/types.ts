import type { InventoryCategory, InventoryItem } from '../../types';

export type UnitOption = { id: string; name: string };

export type FlatItem = {
  id: string;
  name: string;
  type: string;
  categoryId: string;
  categoryName: string;
  unitOfMeasure?: string;
  lastCostPerUnit?: number;
  lastCostPerUnitInclVat?: number;
  lastCostUom?: string;
  currentStock?: number;
  weightedAvgCost?: number | null;
};

export type ItemsTableProps = {
  items: InventoryItem[];
  filteredItems: FlatItem[];
  allTypes: string[];
  categories: InventoryCategory[];
  unitOptions: UnitOption[];
  currentEntityId?: string | null;
  onUpdate: (id: string, values: Omit<InventoryItem, 'id'>) => void;
  onDelete: (id: string) => void;
  onViewInsights: (id: string) => void;
};

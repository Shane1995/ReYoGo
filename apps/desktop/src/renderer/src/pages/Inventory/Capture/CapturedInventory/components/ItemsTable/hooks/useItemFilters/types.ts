import type { InventoryCategory, InventoryItem } from '../../../../types';
import type { ItemCostEntry } from '../../../../hooks/useInventoryCosts';

export type ParsedFilters = { search: string; type: string; categories: string[]; units: string[] };

export type UseItemFiltersProps = {
  items: InventoryItem[];
  categories: InventoryCategory[];
  costMap: Map<string, ItemCostEntry>;
  stockMap: Map<string, number>;
  inventoryTypes: string[];
};

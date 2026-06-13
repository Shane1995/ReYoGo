import type { InventoryCategory, InventoryItem } from '../../types';
import type { UnitOption } from '../../components/ItemsTable/types';

export type InventoryContextValue = {
  categories: InventoryCategory[];
  items: InventoryItem[];
  unitOptions: UnitOption[];
  inventoryTypes: string[];
  addCategory: (category: Omit<InventoryCategory, 'id'>) => string;
  updateCategory: (id: string, updates: Partial<InventoryCategory>) => void;
  addItem: (item: Omit<InventoryItem, 'id'>) => string;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  removeItem: (id: string) => void;
  deleteCategoryFromBackend: (id: string) => Promise<void>;
  deleteItemFromBackend: (id: string) => Promise<void>;
  archiveItemInBackend: (id: string) => Promise<void>;
};

import type {
  InventoryCategory,
  InventoryItem,
} from '@/pages/Inventory/Capture/CapturedInventory/types';
import type { UnitOption } from '@/pages/Inventory/Capture/CapturedInventory/components/ItemsTable/types';

export type InvoiceModalsProps = {
  categoryModalOpen: boolean;
  itemModalOpen: boolean;
  categories: InventoryCategory[];
  unitOptions: UnitOption[];
  onCloseCategory: () => void;
  onCloseItem: () => void;
  onSaveCategory: (category: Omit<InventoryCategory, 'id'>) => void;
  onSaveItem: (item: Omit<InventoryItem, 'id'>) => void;
};

import type { InventoryCategory, InventoryItem } from '../../types';
import type { UnitOption } from '../ItemsTable/types';

export type EditItemDialogProps = {
  item: InventoryItem | null;
  categories: InventoryCategory[];
  unitOptions: UnitOption[];
  onSave: (id: string | null, values: Omit<InventoryItem, 'id'>) => void;
  onClose: () => void;
};

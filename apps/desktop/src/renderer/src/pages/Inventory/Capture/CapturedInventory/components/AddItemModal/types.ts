import type { InventoryCategory, InventoryItem } from '../../types';
import type { UnitOption } from '../ItemsTable/types';

export type AddItemModalProps = {
  open: boolean;
  onClose: () => void;
  categories: InventoryCategory[];
  unitOptions: UnitOption[];
  onSave: (item: Omit<InventoryItem, 'id'>) => void;
};

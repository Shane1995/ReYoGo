import type { InventoryCategory } from '../../types';

export type AddCategoryModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (category: Omit<InventoryCategory, 'id'>) => void;
};

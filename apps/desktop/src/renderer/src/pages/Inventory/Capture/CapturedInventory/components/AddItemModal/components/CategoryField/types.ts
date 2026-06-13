import type { InventoryCategory } from '../../../../types';

export type CategoryFieldProps = {
  categories: InventoryCategory[];
  categoryId: string;
  onChange: (id: string) => void;
};

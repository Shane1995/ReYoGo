import type { InventoryCategory } from '../../../../types';

export type CategorySelectProps = {
  categoryId: string;
  namedCategories: InventoryCategory[];
  types: string[];
  selectedCategory: InventoryCategory | undefined;
  onChange: (id: string) => void;
};

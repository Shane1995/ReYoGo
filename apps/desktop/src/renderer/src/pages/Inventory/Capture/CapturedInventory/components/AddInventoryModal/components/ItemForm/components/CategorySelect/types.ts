import type { InventoryCategory } from '../../../../../../types';

export type CategorySelectProps = {
  categories: InventoryCategory[];
  inventoryTypes: string[];
  value: string;
  onChange: (id: string) => void;
};

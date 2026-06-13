import { InventoryType } from '@reyogo/types';

export function isInventoryType(value: string): value is InventoryType {
  return Object.values(InventoryType).some((type) => type === value);
}

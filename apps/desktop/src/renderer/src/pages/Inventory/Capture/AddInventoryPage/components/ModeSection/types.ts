import type { Mode, ItemRows, CategoryRows } from '../../types';
import type { InventoryCategory } from '../../../CapturedInventory/types';
import type { UnitOption } from '../ItemsSection/types';

export type ModeSectionProps = {
  mode: Mode;
  itemRows: ItemRows;
  catRows: CategoryRows;
  namedCategories: InventoryCategory[];
  categoryTypes: string[];
  unitOptions: UnitOption[];
};

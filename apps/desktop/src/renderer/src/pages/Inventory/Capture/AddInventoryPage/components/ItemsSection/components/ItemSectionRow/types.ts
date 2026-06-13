import type { InventoryCategory } from '../../../../../CapturedInventory/types';
import type { ItemRow, UnitOption } from '../../types';

export type ItemSectionRowProps = {
  row: ItemRow;
  isDupe: boolean;
  namedCategories: InventoryCategory[];
  categoryTypes: string[];
  unitOptions: UnitOption[];
  onUpdateRow: (id: string, u: Partial<ItemRow>) => void;
  onRemoveRow: (id: string) => void;
  onAddRow: () => void;
};

import type { TypeValue, InventoryCategory } from '../../../CapturedInventory/types';

export type ItemRow = {
  id: string;
  name: string;
  categoryId: string;
  type: TypeValue;
  unitOfMeasureId: string;
};

export type UnitOption = { id: string; name: string };

export type ItemsSectionProps = {
  itemRows: ItemRow[];
  itemDupes: Set<string>;
  namedCategories: InventoryCategory[];
  categoryTypes: string[];
  unitOptions: UnitOption[];
  onUpdateRow: (id: string, u: Partial<ItemRow>) => void;
  onRemoveRow: (id: string) => void;
  onAddRow: () => void;
};

import type { TypeValue } from '../../../CapturedInventory/types';

export type CategoryRow = { id: string; name: string; type: TypeValue };

export type CategoriesSectionProps = {
  catRows: CategoryRow[];
  catDupes: Set<string>;
  onUpdateRow: (id: string, u: Partial<CategoryRow>) => void;
  onRemoveRow: (id: string) => void;
  onAddRow: () => void;
};

import { ItemsSection } from '../ItemsSection';
import { CategoriesSection } from '../CategoriesSection';
import type { ModeSectionProps } from './types';

export function ModeSection({
  mode,
  itemRows,
  catRows,
  namedCategories,
  categoryTypes,
  unitOptions,
}: ModeSectionProps) {
  if (mode === 'items') {
    return (
      <ItemsSection
        itemRows={itemRows.itemRows}
        itemDupes={itemRows.itemDupes}
        namedCategories={namedCategories}
        categoryTypes={categoryTypes}
        unitOptions={unitOptions}
        onUpdateRow={itemRows.updateItemRow}
        onRemoveRow={itemRows.removeItemRow}
        onAddRow={itemRows.addItemRow}
      />
    );
  }
  return (
    <CategoriesSection
      catRows={catRows.catRows}
      catDupes={catRows.catDupes}
      onUpdateRow={catRows.updateCatRow}
      onRemoveRow={catRows.removeCatRow}
      onAddRow={catRows.addCatRow}
    />
  );
}

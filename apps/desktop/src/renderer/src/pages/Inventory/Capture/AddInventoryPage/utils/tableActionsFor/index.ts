import type { Mode, ItemRows, CategoryRows } from '../../types';
import type { TableActions } from './types';

export function tableActionsFor(
  mode: Mode,
  itemRows: ItemRows,
  catRows: CategoryRows,
): TableActions {
  if (mode === 'items') {
    return {
      onAddRow: itemRows.addItemRow,
      onClear: itemRows.clearItemRows,
      onSubmit: itemRows.submitItems,
    };
  }
  return {
    onAddRow: catRows.addCatRow,
    onClear: catRows.clearCatRows,
    onSubmit: catRows.submitCats,
  };
}

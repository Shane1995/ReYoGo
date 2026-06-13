import { TableCell, TableRow, cn } from '@reyogo/ui';
import { typeGroupLabel } from '../../../../../CapturedInventory/utils/typeConfig';
import { inputClass, NameCell, RemoveCell } from '../../../SharedTableCells';
import type { ItemSectionRowProps } from './types';

export function ItemSectionRow({
  row,
  isDupe,
  namedCategories,
  categoryTypes,
  unitOptions,
  onUpdateRow,
  onRemoveRow,
  onAddRow,
}: ItemSectionRowProps) {
  return (
    <TableRow key={row.id} className="border-[var(--nav-border)] hover:bg-muted/30">
      <NameCell
        id={`row-name-${row.id}`}
        value={row.name}
        isDupe={isDupe}
        placeholder="Item name"
        onChange={(name) => onUpdateRow(row.id, { name })}
        onEnter={onAddRow}
      />
      <TableCell className="py-2 px-3">
        <select
          value={row.categoryId}
          onChange={(e) => {
            const categoryId = e.target.value;
            const cat = namedCategories.find((c) => c.id === categoryId);
            onUpdateRow(row.id, cat ? { categoryId, type: cat.type } : { categoryId });
          }}
          className={cn(inputClass, 'min-w-[10rem] cursor-pointer')}
        >
          <option value="">Select a category…</option>
          {categoryTypes.map((type) => (
            <optgroup key={type} label={typeGroupLabel(type)}>
              {namedCategories
                .filter((c) => c.type === type)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </TableCell>
      <TableCell className="py-2 px-3">
        <select
          value={row.unitOfMeasureId}
          onChange={(e) => onUpdateRow(row.id, { unitOfMeasureId: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              onAddRow();
            }
          }}
          className={cn(inputClass, 'min-w-[6rem] cursor-pointer')}
        >
          <option value="">Select a unit…</option>
          {unitOptions.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </TableCell>
      <RemoveCell onRemove={() => onRemoveRow(row.id)} />
    </TableRow>
  );
}

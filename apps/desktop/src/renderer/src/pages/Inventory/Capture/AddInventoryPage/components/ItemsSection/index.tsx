import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { cn } from '@reyogo/ui';
import { typeGroupLabel } from '../../../CapturedInventory/utils/typeConfig';
import type { TypeValue } from '../../../CapturedInventory/types';
import type { InventoryCategory } from '../../../CapturedInventory/types';
import { inputClass, NameCell, RemoveCell } from '../SharedTableCells';

export type ItemRow = {
  id: string;
  name: string;
  categoryId: string;
  type: TypeValue;
  unitOfMeasureId: string;
};

type UnitOption = { id: string; name: string };

type Props = {
  itemRows: ItemRow[];
  itemDupes: Set<string>;
  namedCategories: InventoryCategory[];
  categoryTypes: string[];
  unitOptions: UnitOption[];
  onUpdateRow: (id: string, u: Partial<ItemRow>) => void;
  onRemoveRow: (id: string) => void;
  onAddRow: () => void;
};

type RowProps = {
  row: ItemRow;
  isDupe: boolean;
  namedCategories: InventoryCategory[];
  categoryTypes: string[];
  unitOptions: UnitOption[];
  onUpdateRow: (id: string, u: Partial<ItemRow>) => void;
  onRemoveRow: (id: string) => void;
  onAddRow: () => void;
};

function ItemSectionRow({
  row,
  isDupe,
  namedCategories,
  categoryTypes,
  unitOptions,
  onUpdateRow,
  onRemoveRow,
  onAddRow,
}: RowProps) {
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

export function ItemsSection({
  itemRows,
  itemDupes,
  namedCategories,
  categoryTypes,
  unitOptions,
  onUpdateRow,
  onRemoveRow,
  onAddRow,
}: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
          <TableHead className="font-medium text-foreground">Name</TableHead>
          <TableHead className="font-medium text-foreground">Category</TableHead>
          <TableHead className="font-medium text-foreground">Unit of measure</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {itemRows.map((row) => (
          <ItemSectionRow
            key={row.id}
            row={row}
            isDupe={itemDupes.has(row.id)}
            namedCategories={namedCategories}
            categoryTypes={categoryTypes}
            unitOptions={unitOptions}
            onUpdateRow={onUpdateRow}
            onRemoveRow={onRemoveRow}
            onAddRow={onAddRow}
          />
        ))}
      </TableBody>
    </Table>
  );
}

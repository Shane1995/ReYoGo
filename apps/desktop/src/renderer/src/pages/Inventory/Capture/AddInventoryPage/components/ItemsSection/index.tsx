import { Table, TableBody, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { ItemSectionRow } from './components/ItemSectionRow';
import type { ItemsSectionProps } from './types';

export function ItemsSection({
  itemRows,
  itemDupes,
  namedCategories,
  categoryTypes,
  unitOptions,
  onUpdateRow,
  onRemoveRow,
  onAddRow,
}: ItemsSectionProps) {
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

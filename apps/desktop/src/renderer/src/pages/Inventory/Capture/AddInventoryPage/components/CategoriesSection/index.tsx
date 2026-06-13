import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { INVENTORY_TYPES } from '@reyogo/types';
import { cn } from '@reyogo/ui';
import { inputClass, NameCell, RemoveCell } from '../SharedTableCells';
import type { CategoriesSectionProps } from './types';

export function CategoriesSection({
  catRows,
  catDupes,
  onUpdateRow,
  onRemoveRow,
  onAddRow,
}: CategoriesSectionProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-[var(--nav-border)] hover:bg-transparent">
          <TableHead className="font-medium text-foreground">Name</TableHead>
          <TableHead className="font-medium text-foreground">Type</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {catRows.map((row) => {
          const isDupe = catDupes.has(row.id);
          return (
            <TableRow key={row.id} className="border-[var(--nav-border)] hover:bg-muted/30">
              <NameCell
                id={`row-name-${row.id}`}
                value={row.name}
                isDupe={isDupe}
                placeholder="Category name"
                onChange={(name) => onUpdateRow(row.id, { name })}
                onEnter={onAddRow}
              />
              <TableCell className="py-2 px-3">
                <select
                  value={row.type}
                  onChange={(e) => onUpdateRow(row.id, { type: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      e.preventDefault();
                      onAddRow();
                    }
                  }}
                  className={cn(inputClass, 'min-w-[8rem] cursor-pointer')}
                >
                  {INVENTORY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </TableCell>
              <RemoveCell onRemove={() => onRemoveRow(row.id)} />
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

import { Button } from '@reyogo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@reyogo/ui';
import { INVENTORY_TYPES } from '@reyogo/types';
import { cn } from '@reyogo/ui';
import type { TypeValue } from '../../../CapturedInventory/types';

const inputClass = cn(
  'h-8 w-full rounded-md border border-input bg-muted px-2.5 text-sm',
  'focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 focus:ring-offset-0',
);

export type CategoryRow = { id: string; name: string; type: TypeValue };

type Props = {
  catRows: CategoryRow[];
  catDupes: Set<string>;
  onUpdateRow: (id: string, u: Partial<CategoryRow>) => void;
  onRemoveRow: (id: string) => void;
  onAddRow: () => void;
};

export function CategoriesSection({
  catRows,
  catDupes,
  onUpdateRow,
  onRemoveRow,
  onAddRow,
}: Props) {
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
              <TableCell className="py-2 px-3">
                <div className="flex items-center gap-2">
                  <input
                    id={`row-name-${row.id}`}
                    value={row.name}
                    onChange={(e) => onUpdateRow(row.id, { name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onAddRow();
                    }}
                    className={cn(
                      inputClass,
                      'min-w-[10rem]',
                      isDupe && 'border-destructive focus:ring-destructive/50',
                    )}
                    placeholder="Category name"
                  />
                  {isDupe && (
                    <span className="shrink-0 text-xs text-destructive">Already exists</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2 px-3">
                <select
                  value={row.type}
                  onChange={(e) => onUpdateRow(row.id, { type: e.target.value as TypeValue })}
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
              <TableCell className="py-2 px-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onRemoveRow(row.id)}
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

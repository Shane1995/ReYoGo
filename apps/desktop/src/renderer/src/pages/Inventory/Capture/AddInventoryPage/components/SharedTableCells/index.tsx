import { Button } from '@reyogo/ui';
import { TableCell } from '@reyogo/ui';
import { cn } from '@reyogo/ui';

export const inputClass = cn(
  'h-8 w-full rounded-md border border-input bg-muted px-2.5 text-sm',
  'focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50 focus:ring-offset-0',
);

type NameCellProps = {
  id: string;
  value: string;
  isDupe: boolean;
  placeholder: string;
  onChange: (value: string) => void;
  onEnter: () => void;
};

export function NameCell({ id, value, isDupe, placeholder, onChange, onEnter }: NameCellProps) {
  return (
    <TableCell className="py-2 px-3">
      <div className="flex items-center gap-2">
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEnter();
          }}
          className={cn(
            inputClass,
            'min-w-[10rem]',
            isDupe && 'border-destructive focus:ring-destructive/50',
          )}
          placeholder={placeholder}
        />
        {isDupe && <span className="shrink-0 text-xs text-destructive">Already exists</span>}
      </div>
    </TableCell>
  );
}

type RemoveCellProps = {
  onRemove: () => void;
};

export function RemoveCell({ onRemove }: RemoveCellProps) {
  return (
    <TableCell className="py-2 px-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={onRemove}
      >
        Remove
      </Button>
    </TableCell>
  );
}

import { Button, TableCell } from '@reyogo/ui';
import type { RemoveCellProps } from './types';

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

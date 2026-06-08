import { XIcon } from 'lucide-react';
import { TableCell } from '@reyogo/ui';

export function RemoveLineCell({
  confirmingDelete,
  onRemove,
}: {
  confirmingDelete: boolean;
  onRemove: () => void;
}) {
  return (
    <TableCell className="py-2 px-2 text-right">
      {confirmingDelete ? (
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-[11px] text-destructive/70 whitespace-nowrap">
            Enter ↵ · Esc to cancel
          </span>
          <button
            type="button"
            onClick={onRemove}
            className="rounded p-1 text-destructive bg-destructive/10 hover:bg-destructive/20 transition-all"
          >
            <XIcon className="size-3.5" aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onRemove}
          title="Remove line"
          className="opacity-0 group-hover:opacity-100 rounded p-1 text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <XIcon className="size-3.5" aria-hidden />
        </button>
      )}
    </TableCell>
  );
}

import { Button } from '@reyogo/ui';
import type { ConfirmDeleteActionsProps } from './types';

export function ConfirmDeleteActions({
  selectedCount,
  onConfirmDelete,
  onCancelDelete,
}: ConfirmDeleteActionsProps) {
  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10 hover:text-amber-600"
        onClick={onConfirmDelete}
      >
        Archive {selectedCount}
      </Button>
      <button
        type="button"
        onClick={onCancelDelete}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Cancel
      </button>
    </>
  );
}

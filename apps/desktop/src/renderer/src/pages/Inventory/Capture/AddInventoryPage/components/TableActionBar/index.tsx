import { PlusIcon } from 'lucide-react';
import { Button } from '@reyogo/ui';
import type { TableActionBarProps } from './types';

export function TableActionBar({
  mode,
  hasIncompleteItemRows,
  canSubmitItems,
  canSubmitCats,
  onAddRow,
  onClear,
  onSubmit,
}: TableActionBarProps) {
  return (
    <div className="border-t border-[var(--nav-border)] bg-muted/10">
      <div className="flex justify-end px-3 py-2">
        <Button type="button" variant="ghost" size="sm" onClick={onAddRow} className="gap-1.5">
          <PlusIcon className="size-4" aria-hidden />
          Add row
        </Button>
      </div>
      <div className="flex justify-end gap-2 border-t border-[var(--nav-border)] px-3 py-2 items-center">
        {mode === 'items' && hasIncompleteItemRows && (
          <p className="text-xs text-muted-foreground mr-auto">Incomplete rows will be skipped</p>
        )}
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear
        </Button>
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={mode === 'items' ? !canSubmitItems : !canSubmitCats}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}

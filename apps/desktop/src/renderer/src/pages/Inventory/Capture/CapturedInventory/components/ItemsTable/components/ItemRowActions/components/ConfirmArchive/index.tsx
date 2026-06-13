import type { ConfirmArchiveProps } from './types';

export function ConfirmArchive({ onConfirm, onCancel }: ConfirmArchiveProps) {
  return (
    <div className="px-2 py-1.5 text-xs text-muted-foreground">
      <p className="mb-2 font-medium text-foreground">Archive this item?</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-500/10 transition-colors"
        >
          Archive
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded px-2 py-1 text-xs hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

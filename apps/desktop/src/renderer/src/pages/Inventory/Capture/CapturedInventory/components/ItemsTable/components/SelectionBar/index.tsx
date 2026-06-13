import { ConfirmDeleteActions } from './components/ConfirmDeleteActions';
import { DefaultActions } from './components/DefaultActions';
import type { SelectionBarProps } from './types';

export function SelectionBar({
  selectedCount,
  confirmBulkDelete,
  onAddToInvoice,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  onClear,
}: SelectionBarProps) {
  return (
    <div className="mb-2 flex items-center gap-3 rounded-lg border border-[var(--nav-active-border)]/20 bg-[var(--nav-accent)] px-3 py-1.5">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-[var(--nav-accent-foreground)]">
        <span className="size-1.5 rounded-full bg-primary animate-pulse inline-block" />
        {selectedCount} selected
      </span>
      <div className="h-3 w-px bg-[var(--nav-active-border)]/20" />
      {confirmBulkDelete ? (
        <ConfirmDeleteActions
          selectedCount={selectedCount}
          onConfirmDelete={onConfirmDelete}
          onCancelDelete={onCancelDelete}
        />
      ) : (
        <DefaultActions
          onAddToInvoice={onAddToInvoice}
          onRequestDelete={onRequestDelete}
          onClear={onClear}
        />
      )}
    </div>
  );
}

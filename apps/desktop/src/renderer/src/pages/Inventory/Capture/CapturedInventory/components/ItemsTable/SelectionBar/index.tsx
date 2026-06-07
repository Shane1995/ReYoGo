import { ReceiptIcon, Trash2Icon, XIcon } from 'lucide-react';
import { Button } from '@reyogo/ui';

type Props = {
  selectedCount: number;
  confirmBulkDelete: boolean;
  onAddToInvoice: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onClear: () => void;
};

function ConfirmDeleteActions({
  selectedCount,
  onConfirmDelete,
  onCancelDelete,
}: {
  selectedCount: number;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
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

function DefaultActions({
  onAddToInvoice,
  onRequestDelete,
  onClear,
}: {
  onAddToInvoice: () => void;
  onRequestDelete: () => void;
  onClear: () => void;
}) {
  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 gap-1.5 text-xs text-primary hover:bg-primary/10 hover:text-primary"
        onClick={onAddToInvoice}
      >
        <ReceiptIcon className="size-3" />
        Add to invoice
      </Button>
      <div className="h-3 w-px bg-border" />
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 gap-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={onRequestDelete}
      >
        <Trash2Icon className="size-3" />
        Archive
      </Button>
      <button
        type="button"
        onClick={onClear}
        className="ml-auto flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        <XIcon className="size-3" />
        Clear
      </button>
    </>
  );
}

export function SelectionBar({
  selectedCount,
  confirmBulkDelete,
  onAddToInvoice,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  onClear,
}: Props) {
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

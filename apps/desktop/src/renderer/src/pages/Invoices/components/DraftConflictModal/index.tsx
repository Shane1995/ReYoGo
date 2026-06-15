import { CopyIcon, PlusIcon, RotateCcwIcon, XIcon } from 'lucide-react';
import { ActionButton } from './components/ActionButton';
import type { DraftConflictModalProps } from './types';

export function DraftConflictModal({
  open,
  draftItemCount,
  onAppend,
  onFresh,
  onCancel,
}: DraftConflictModalProps) {
  if (!open) return null;

  const itemLabel = `${draftItemCount} ${draftItemCount === 1 ? 'item' : 'items'}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[var(--nav-border)] bg-background p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40">
          <CopyIcon className="size-5 text-blue-500" />
        </div>

        <p className="mb-2 text-base font-semibold text-foreground">Draft invoice in progress</p>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          You have <span className="font-medium text-foreground">{itemLabel}</span> in your current
          draft. What would you like to do with the items you're adding?
        </p>

        <div className="flex flex-col gap-2.5">
          <ActionButton
            onClick={onAppend}
            className="border-blue-200 bg-blue-500 text-white hover:bg-blue-600 dark:border-blue-800"
            icon={<PlusIcon className="size-4" />}
            iconClass="bg-white/20"
            label="Append to draft"
            sublabel="Add these items to your existing lines"
          />
          <ActionButton
            onClick={onFresh}
            className="border-[var(--border)] bg-background text-foreground hover:bg-muted/50"
            icon={<RotateCcwIcon className="size-4 text-muted-foreground" />}
            iconClass="bg-muted"
            label="Start fresh"
            sublabel="Replace the draft with these items"
          />
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="mt-5 flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
        >
          <XIcon className="size-3" />
          Cancel
        </button>
      </div>
    </div>
  );
}

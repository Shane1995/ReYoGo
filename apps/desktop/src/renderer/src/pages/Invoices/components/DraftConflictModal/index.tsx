import { CopyIcon, PlusIcon, RotateCcwIcon, XIcon } from 'lucide-react';
import { cn } from '@reyogo/ui';

type Props = {
  open: boolean;
  draftItemCount: number;
  onAppend: () => void;
  onFresh: () => void;
  onCancel: () => void;
};

const actionBtn = cn(
  'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors',
);

export function DraftConflictModal({ open, draftItemCount, onAppend, onFresh, onCancel }: Props) {
  if (!open) return null;

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
          You have{' '}
          <span className="font-medium text-foreground">
            {draftItemCount} {draftItemCount === 1 ? 'item' : 'items'}
          </span>{' '}
          in your current draft. What would you like to do with the items you're adding?
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onAppend}
            className={cn(
              actionBtn,
              'border-blue-200 bg-blue-500 text-white hover:bg-blue-600 dark:border-blue-800',
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
              <PlusIcon className="size-4" />
            </span>
            <span>
              <span className="block font-semibold">Append to draft</span>
              <span className="block text-xs font-normal opacity-80">
                Add these items to your existing lines
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={onFresh}
            className={cn(
              actionBtn,
              'border-[var(--border)] bg-background text-foreground hover:bg-muted/50',
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <RotateCcwIcon className="size-4 text-muted-foreground" />
            </span>
            <span>
              <span className="block font-semibold">Start fresh</span>
              <span className="block text-xs font-normal text-muted-foreground">
                Replace the draft with these items
              </span>
            </span>
          </button>
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

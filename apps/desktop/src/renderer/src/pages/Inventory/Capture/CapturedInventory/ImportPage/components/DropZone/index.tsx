import { UploadIcon } from 'lucide-react';
import { cn } from '@reyogo/ui';
import type { DropZoneProps } from './types';

export function DropZone({ onClick, disabled }: DropZoneProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full rounded-xl border-2 border-dashed border-[var(--nav-border)] bg-muted p-12',
        'flex flex-col items-center gap-4 text-center',
        disabled
          ? 'cursor-not-allowed opacity-40'
          : 'hover:border-[var(--nav-active-border)] hover:bg-muted/80 transition-colors',
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--nav-bg)] border border-[var(--nav-border)]">
        <UploadIcon className="size-6 text-[var(--nav-active-border)]" />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">Choose a file to review</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Supports Excel (.xlsx) and CSV — nothing is saved until you confirm
        </p>
      </div>
    </button>
  );
}

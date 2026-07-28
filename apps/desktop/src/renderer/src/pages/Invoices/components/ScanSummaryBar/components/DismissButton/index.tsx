import { XIcon } from 'lucide-react';
import type { DismissButtonProps } from './types';

function isDismissKey(key: string): boolean {
  return key === 'Enter' || key === ' ';
}

export function DismissButton({ onDismiss }: DismissButtonProps) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onDismiss();
      }}
      onKeyDown={(e) => {
        if (!isDismissKey(e.key)) return;
        e.stopPropagation();
        onDismiss();
      }}
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <XIcon className="size-3.5" />
    </span>
  );
}

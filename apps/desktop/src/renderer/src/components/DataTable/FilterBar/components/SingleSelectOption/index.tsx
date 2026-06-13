import { cn } from '@reyogo/ui';
import { CheckIcon } from 'lucide-react';
import type { SingleSelectOptionProps } from './types';

export function SingleSelectOption({ opt, selected, onSelect }: SingleSelectOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(opt.value)}
      className={cn(
        'flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--accent)]',
        selected === opt.value && 'bg-[var(--accent)]',
      )}
    >
      <span className="size-3 shrink-0">
        {selected === opt.value && <CheckIcon className="size-3 text-[var(--primary)]" />}
      </span>
      <span className="truncate">{opt.label}</span>
    </button>
  );
}

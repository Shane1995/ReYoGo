import { cn } from '@reyogo/ui';
import { CheckIcon } from 'lucide-react';
import type { MultiSelectOptionProps } from './types';

export function MultiSelectOption({ opt, selected, onToggle }: MultiSelectOptionProps) {
  const isSelected = selected.includes(opt.value);
  return (
    <button
      type="button"
      onClick={() => onToggle(opt.value)}
      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--accent)]"
    >
      <div
        className={cn(
          'flex size-3.5 shrink-0 items-center justify-center rounded-sm border',
          isSelected ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--border)]',
        )}
      >
        {isSelected && <CheckIcon className="size-2.5 text-white" />}
      </div>
      <span className="truncate">{opt.label}</span>
    </button>
  );
}

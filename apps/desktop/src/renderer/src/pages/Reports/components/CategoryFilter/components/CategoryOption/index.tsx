import { cn } from '@reyogo/ui';
import { CheckIcon } from 'lucide-react';
import type { CategoryOptionProps } from './types';

export function CategoryOption({ category, selected, onToggle }: CategoryOptionProps) {
  const isSelected = selected.includes(category);
  return (
    <button
      type="button"
      onClick={() => onToggle(category)}
      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-foreground hover:bg-accent"
    >
      <div
        className={cn(
          'flex size-3.5 shrink-0 items-center justify-center rounded-sm border',
          isSelected
            ? 'border-[var(--nav-active-border)] bg-[var(--nav-active-border)]'
            : 'border-input',
        )}
      >
        {isSelected && <CheckIcon className="size-2.5 text-white" />}
      </div>
      <span className="truncate">{category}</span>
    </button>
  );
}

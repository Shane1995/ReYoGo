import { cn } from '@reyogo/ui';
import { MultiSelectOption } from '../MultiSelectOption';
import type { MultiSelectGroupsProps } from './types';

export function MultiSelectGroups({ groups, options, selected, onToggle }: MultiSelectGroupsProps) {
  if (options.length === 0) {
    return <p className="px-2 py-1.5 text-xs text-[var(--muted-foreground)]">No options</p>;
  }
  return (
    <>
      {groups.map(({ label, items }, i) => (
        <div key={label || i}>
          {label && (
            <p
              className={cn(
                'px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]/60',
                i > 0 && 'mt-1 border-t border-[var(--border)] pt-2',
              )}
            >
              {label}
            </p>
          )}
          {items.map((opt) => (
            <MultiSelectOption key={opt.value} opt={opt} selected={selected} onToggle={onToggle} />
          ))}
        </div>
      ))}
    </>
  );
}

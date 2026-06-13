import { cn } from '@reyogo/ui';
import type { ReviewRowProps } from './types';

export function ReviewRow({ selected, onToggle, disabled, children }: ReviewRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 text-sm',
        disabled ? 'opacity-50' : 'hover:bg-muted/20 cursor-pointer',
      )}
      onClick={disabled ? undefined : onToggle}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        disabled={disabled}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 rounded border-[var(--nav-border)] text-[var(--nav-active-border)] cursor-pointer"
      />
      {children}
    </div>
  );
}

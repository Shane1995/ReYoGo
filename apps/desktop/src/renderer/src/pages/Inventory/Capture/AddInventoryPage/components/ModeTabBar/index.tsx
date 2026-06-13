import { cn } from '@reyogo/ui';
import { MODES } from './constants';
import type { ModeTabBarProps } from './types';

export function ModeTabBar({ mode, onSelect }: ModeTabBarProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-[var(--nav-border)] bg-muted/20 p-0.5 gap-0.5">
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onSelect(m)}
          className={cn(
            'rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-150',
            mode === m
              ? 'bg-[var(--nav-active-border)]/15 text-[var(--nav-active-border)] shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {m === 'items' ? 'Items' : 'Categories'}
        </button>
      ))}
    </div>
  );
}

import { ArrowLeftIcon } from 'lucide-react';
import { subtitleOf } from './utils/subtitleOf';
import type { ItemTrendHeaderProps } from './types';

export function ItemTrendHeader({ group, stats, onBack }: ItemTrendHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={onBack}
        className="mt-1 flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-muted-foreground/50 hover:text-foreground transition-colors shrink-0"
      >
        <ArrowLeftIcon className="size-3" />
        Back
      </button>
      <div>
        <h1 className="text-lg font-semibold text-foreground leading-tight">{group.name}</h1>
        <p className="text-sm text-muted-foreground/70 mt-0.5">{subtitleOf(group, stats)}</p>
      </div>
    </div>
  );
}

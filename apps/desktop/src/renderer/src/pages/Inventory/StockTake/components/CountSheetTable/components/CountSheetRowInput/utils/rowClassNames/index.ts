import { cn } from '@reyogo/ui';

export function rowClassName(isCounted: boolean): string {
  return cn(
    'grid grid-cols-[1fr_6rem_6rem_7rem] items-center gap-3 border-b border-border px-4 py-2.5 last:border-0',
    isCounted && 'bg-emerald-50/60 dark:bg-emerald-950/20',
  );
}

export function dotClassName(isCounted: boolean): string {
  return cn('h-1.5 w-1.5 shrink-0 rounded-full', isCounted && 'bg-emerald-500');
}

export function valueClassName(isCounted: boolean): string {
  return cn('text-right text-sm font-semibold tabular-nums', !isCounted && 'text-muted-foreground');
}

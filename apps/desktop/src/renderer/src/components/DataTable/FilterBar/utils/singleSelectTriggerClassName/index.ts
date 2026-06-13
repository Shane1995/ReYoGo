import { cn } from '@reyogo/ui';

export function singleSelectTriggerClassName(selected: string): string {
  return cn(
    'flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors',
    selected
      ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
      : 'border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--input)] hover:text-[var(--foreground)]',
  );
}

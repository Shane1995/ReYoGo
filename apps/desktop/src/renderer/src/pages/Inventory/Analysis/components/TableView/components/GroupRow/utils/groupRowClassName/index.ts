import { cn } from '@reyogo/ui';

export function groupRowClassName(isExpanded: boolean, index: number): string {
  return cn(
    'border-[var(--nav-border)] transition-colors hover:bg-muted/20 group',
    !isExpanded && index % 2 !== 0 && 'bg-black/[0.025]',
  );
}

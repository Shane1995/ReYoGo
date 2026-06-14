import { cn } from '@reyogo/ui';

function changeColorCls(v: number | null): string {
  if (v === null) return 'text-muted-foreground';
  if (v > 0) return 'text-destructive';
  if (v < 0) return 'text-green-600 dark:text-green-500';
  return 'text-muted-foreground';
}

export function changeCls(v: number | null, bold = false) {
  return cn('font-mono', bold && 'font-semibold', changeColorCls(v));
}

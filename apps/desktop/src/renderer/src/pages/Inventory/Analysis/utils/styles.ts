import { cn } from '@reyogo/ui';

export function changeCls(v: number | null, bold = false) {
  return cn(
    'font-mono',
    bold && 'font-semibold',
    v === null
      ? 'text-muted-foreground'
      : v > 0
        ? 'text-destructive'
        : v < 0
          ? 'text-green-600 dark:text-green-500'
          : 'text-muted-foreground',
  );
}

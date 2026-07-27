import type { TaxableCellProps } from './types';

export function TaxableCell({ isVatable }: TaxableCellProps) {
  if (isVatable) {
    return <span className="text-[var(--nav-active-border)]">✓</span>;
  }
  return <span className="text-muted-foreground/30">—</span>;
}

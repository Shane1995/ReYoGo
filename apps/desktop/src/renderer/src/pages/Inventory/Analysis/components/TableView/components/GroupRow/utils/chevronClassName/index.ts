export function chevronClassName(isExpanded: boolean): string {
  if (isExpanded) return 'size-3.5 mx-auto transition-all rotate-90 text-primary';
  return 'size-3.5 mx-auto transition-all text-muted-foreground/30 group-hover:text-muted-foreground';
}

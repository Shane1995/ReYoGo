import type { SortDir } from '@/hooks/useTableSort';

export function sortGlyphClass(active: boolean, dir: SortDir, target: 'asc' | 'desc'): string {
  if (active && dir === target) return 'text-[var(--nav-active-border)]';
  return 'opacity-30';
}

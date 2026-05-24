import { cn } from '../lib/utils';

export const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
  cn(
    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
    'border-l-2 border-l-transparent',
    isActive
      ? 'border-l-[var(--nav-active-border)] bg-[var(--nav-accent)] text-[var(--nav-foreground)]'
      : 'text-[var(--nav-foreground-muted)] hover:bg-[var(--nav-accent)] hover:text-[var(--nav-foreground)]',
  );

import * as React from 'react';
import { cn } from '../lib/utils';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  iconClassName?: string;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, icon: Icon, loading = false, iconClassName, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          {label}
        </span>
        <div className={cn('rounded-lg p-2 bg-[var(--muted)]', iconClassName)}>
          <Icon className="size-4 text-[var(--muted-foreground)]" aria-hidden />
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-24 animate-pulse rounded-md bg-[var(--muted)]" />
      ) : (
        <span className="font-mono text-2xl font-semibold tabular-nums text-[var(--card-foreground)]">
          {value}
        </span>
      )}
    </div>
  ),
);
StatCard.displayName = 'StatCard';

export { StatCard };

import type { StatCardProps } from './types';

export function StatCard({ label, value, muted, className }: StatCardProps) {
  return (
    <div className="rounded-lg border border-[var(--nav-border)] bg-background p-3">
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
        {label}
      </p>
      <p
        className={`mt-1.5 font-mono text-base font-semibold tabular-nums ${className ?? (muted ? 'text-muted-foreground' : 'text-foreground')}`}
      >
        {value}
      </p>
    </div>
  );
}

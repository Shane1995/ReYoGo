import { cn } from '@reyogo/ui';
import type { SummaryCardProps } from './types';

export function SummaryCard({ icon, value, label, color }: SummaryCardProps) {
  const bg = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30',
    muted: 'bg-muted/40 border-[var(--nav-border)]',
    amber: 'bg-amber-500/10 border-amber-500/30',
    red: 'bg-red-500/10 border-red-500/30',
  }[color];

  return (
    <div className={cn('rounded-lg border px-3 py-2.5 flex items-center gap-2.5', bg)}>
      {icon}
      <div>
        <div className="text-lg font-bold text-foreground leading-none">{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  );
}

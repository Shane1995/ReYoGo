import { cn } from '@/lib/utils';

export function SummaryCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: 'emerald' | 'muted' | 'amber' | 'red';
}) {
  const bg = {
    emerald: 'bg-emerald-50 border-emerald-200',
    muted: 'bg-muted/40 border-[var(--nav-border)]',
    amber: 'bg-amber-50 border-amber-200',
    red: 'bg-red-50 border-red-200',
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

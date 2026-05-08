import { CheckCircle2Icon, InfoIcon, XCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  new: {
    label: 'New',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2Icon,
  },
  exists: {
    label: 'Already exists',
    className: 'bg-muted text-muted-foreground border-[var(--nav-border)]',
    icon: InfoIcon,
  },
  unresolved: {
    label: 'No category',
    className: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircleIcon,
  },
} as const;

export function StatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        cfg.className
      )}
    >
      <Icon className="size-3 shrink-0" />
      {cfg.label}
    </span>
  );
}

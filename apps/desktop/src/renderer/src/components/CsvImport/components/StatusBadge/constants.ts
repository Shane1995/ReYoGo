import { CheckCircle2Icon, InfoIcon, XCircleIcon } from 'lucide-react';
import { ReviewStatus } from '../../review';

export const STATUS_CONFIG = {
  [ReviewStatus.New]: {
    label: 'New',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2Icon,
  },
  [ReviewStatus.Exists]: {
    label: 'Already exists',
    className: 'bg-muted text-muted-foreground border-[var(--nav-border)]',
    icon: InfoIcon,
  },
  [ReviewStatus.Unresolved]: {
    label: 'No category',
    className: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircleIcon,
  },
} as const;

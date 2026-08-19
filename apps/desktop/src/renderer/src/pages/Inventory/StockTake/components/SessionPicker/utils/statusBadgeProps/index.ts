import type { StatusBadgeProps } from './types';

export function statusBadgeProps(status: string): StatusBadgeProps {
  if (status === 'complete') return { variant: 'secondary', label: 'Completed' };
  return { variant: 'outline', label: 'Open' };
}

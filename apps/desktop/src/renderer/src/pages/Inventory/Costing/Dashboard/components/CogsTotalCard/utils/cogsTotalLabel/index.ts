import type { COGSSummary } from '@reyogo/types';
import { fmt } from '../../../../utils/fmt';

export function cogsTotalLabel(cogs: COGSSummary | null): string {
  if (!cogs) return '—';
  return fmt(cogs.total);
}

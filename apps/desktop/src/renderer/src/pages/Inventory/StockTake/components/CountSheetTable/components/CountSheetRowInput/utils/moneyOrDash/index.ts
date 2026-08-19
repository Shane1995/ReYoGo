import { formatZAR } from '@/utils/format';

export function moneyOrDash(value: number | null): string {
  return value === null ? '—' : formatZAR(value);
}

import { TYPE_LABELS } from '../../constants';

export function typeLabel(t: string) {
  return TYPE_LABELS[t] ?? t.charAt(0).toUpperCase() + t.slice(1);
}

import type { Align } from '../../types';

export function alignClass(align?: Align): string {
  if (align === 'right') return 'text-right';
  if (align === 'center') return 'text-center';
  return 'text-left';
}

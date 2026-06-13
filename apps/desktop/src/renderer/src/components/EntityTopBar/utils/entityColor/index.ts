import { ENTITY_COLORS } from '../../constants';
import type { EntityColor } from '../../types';

export function entityColor(id: string): EntityColor {
  const idx = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % ENTITY_COLORS.length;
  return ENTITY_COLORS[idx] ?? ENTITY_COLORS[0]!;
}

import { KNOWN_TYPE_CONFIG, FALLBACK_PALETTE, TYPE_EMOJI } from './constants';
import type { TypeConfig } from './types';

export type { TypeConfig } from './types';

export function typeGroupLabel(type: string): string {
  const label = type.replace(/-/g, '‑').replace(/^\w/, (c) => c.toUpperCase());
  return TYPE_EMOJI[type] ? `${TYPE_EMOJI[type]} ${label}` : label;
}

export function getTypeConfig(type: string, allTypes: string[]): TypeConfig {
  if (KNOWN_TYPE_CONFIG[type]) return KNOWN_TYPE_CONFIG[type];
  const idx = allTypes.indexOf(type);
  return FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length] ?? FALLBACK_PALETTE[0]!;
}

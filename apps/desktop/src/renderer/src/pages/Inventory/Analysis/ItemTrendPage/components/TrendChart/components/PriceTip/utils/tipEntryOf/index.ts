import type { TipEntry } from '../../types';

export function tipEntryOf(payload?: { payload: TipEntry }[]): TipEntry | null {
  if (!payload || payload.length === 0) return null;
  const first = payload[0];
  if (!first) return null;
  return first.payload;
}

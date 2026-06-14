import type { ArchivedItem } from '../../types';

export function sortByName(a: ArchivedItem, b: ArchivedItem): number {
  return a.name.localeCompare(b.name);
}

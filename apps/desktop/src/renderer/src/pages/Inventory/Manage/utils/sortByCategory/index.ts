import type { ArchivedItem } from '../../types';

export function sortByCategory(a: ArchivedItem, b: ArchivedItem): number {
  return a.categoryName.localeCompare(b.categoryName);
}

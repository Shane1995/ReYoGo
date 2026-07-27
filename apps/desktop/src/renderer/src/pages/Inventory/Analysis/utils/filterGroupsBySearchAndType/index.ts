import type { ItemGroup } from '../../types';

export function filterGroupsBySearchAndType(
  groups: ItemGroup[],
  search: string,
  filterType: string,
): ItemGroup[] {
  let filtered = groups;
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((g) => g.name.toLowerCase().includes(q));
  }
  if (filterType) {
    filtered = filtered.filter((g) => g.categoryType === filterType);
  }
  return filtered;
}

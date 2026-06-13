import type { FilterOption } from '../../../types';
import type { FilterGroup } from '../../types';

export function buildGroups(options: FilterOption[]): FilterGroup[] {
  if (!options.some((opt) => opt.group)) return [{ label: '', items: options }];
  return options.reduce<FilterGroup[]>((groups, opt) => {
    const label = opt.group ?? '';
    const existing = groups.find((group) => group.label === label);
    if (!existing) return [...groups, { label, items: [opt] }];
    return groups.map((group) =>
      group.label === label ? { ...group, items: [...group.items, opt] } : group,
    );
  }, []);
}

export function toggleCategory(selected: string[], category: string): string[] {
  if (selected.includes(category)) return selected.filter((c) => c !== category);
  return [...selected, category];
}

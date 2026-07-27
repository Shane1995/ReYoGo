export function triggerLabelOf(selected: string[]): string {
  if (selected.length === 0) return 'All categories';
  return `${selected.length} selected`;
}

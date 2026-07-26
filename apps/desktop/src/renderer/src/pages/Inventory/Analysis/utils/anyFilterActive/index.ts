export function anyFilterActive(...filters: string[]): boolean {
  return filters.some((filter) => !!filter);
}

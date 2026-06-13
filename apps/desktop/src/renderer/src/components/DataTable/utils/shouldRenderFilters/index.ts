export function shouldRenderFilters(hideFilters: boolean, filterCount: number): boolean {
  if (hideFilters) return false;
  return filterCount > 0;
}

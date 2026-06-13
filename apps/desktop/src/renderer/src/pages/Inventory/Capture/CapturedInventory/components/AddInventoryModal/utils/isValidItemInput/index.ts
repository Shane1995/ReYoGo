export function isValidItemInput(trimmed: string, categoryId: string): boolean {
  return Boolean(trimmed) && Boolean(categoryId);
}

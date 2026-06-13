export function ariaCheckedOf(
  checked: boolean,
  indeterminate: boolean | undefined,
): boolean | 'mixed' {
  if (indeterminate) return 'mixed';
  return checked;
}

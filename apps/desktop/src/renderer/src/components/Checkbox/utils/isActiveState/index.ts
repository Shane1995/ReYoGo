export function isActiveState(checked: boolean, indeterminate: boolean | undefined): boolean {
  if (checked) return true;
  return !!indeterminate;
}

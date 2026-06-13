export function displayCheckedOf(checked: boolean, indeterminate: boolean | undefined): boolean {
  if (indeterminate) return false;
  return checked;
}

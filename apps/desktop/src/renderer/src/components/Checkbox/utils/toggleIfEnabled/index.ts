export function toggleIfEnabled(
  disabled: boolean | undefined,
  isChecked: boolean,
  onChange: (checked: boolean) => void,
): void {
  if (disabled) return;
  onChange(!isChecked);
}

interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

function displayCheckedOf(checked: boolean, indeterminate: boolean | undefined): boolean {
  if (indeterminate) return false;
  return checked;
}

function ariaCheckedOf(checked: boolean, indeterminate: boolean | undefined): boolean | 'mixed' {
  if (indeterminate) return 'mixed';
  return checked;
}

function isActiveState(checked: boolean, indeterminate: boolean | undefined): boolean {
  if (checked) return true;
  return !!indeterminate;
}

function checkboxBoxClassName(disabled: boolean | undefined, active: boolean): string {
  const cursorCls = disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer';
  const stateCls = active
    ? 'bg-[#20C997] border-[#20C997]'
    : 'bg-transparent border-input hover:border-[#20C997]/70';
  return [
    'inline-flex items-center justify-center size-[18px] rounded-[4px] border shrink-0',
    'transition-[background,border-color] duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20C997]/50',
    cursorCls,
    stateCls,
  ].join(' ');
}

function toggleIfEnabled(
  disabled: boolean | undefined,
  isChecked: boolean,
  onChange: (checked: boolean) => void,
): void {
  if (disabled) return;
  onChange(!isChecked);
}

function CheckboxIcon({
  checked,
  indeterminate,
}: {
  checked: boolean;
  indeterminate: boolean | undefined;
}) {
  if (indeterminate) {
    return (
      <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
        <path d="M1 1H9" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (!checked) return null;
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path
        d="M1 4L3.5 6.5L9 1"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Checkbox({ checked, indeterminate, onChange, disabled, label }: CheckboxProps) {
  const displayChecked = displayCheckedOf(checked, indeterminate);
  const active = isActiveState(checked, indeterminate);
  const boxCls = checkboxBoxClassName(disabled, active);

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={ariaCheckedOf(checked, indeterminate)}
      aria-disabled={disabled}
      disabled={disabled}
      className={label ? 'inline-flex items-center gap-2' : undefined}
      onClick={() => toggleIfEnabled(disabled, displayChecked, onChange)}
    >
      <span className={boxCls}>
        <CheckboxIcon checked={checked} indeterminate={indeterminate} />
      </span>
      {label && <span className="text-sm select-none">{label}</span>}
    </button>
  );
}

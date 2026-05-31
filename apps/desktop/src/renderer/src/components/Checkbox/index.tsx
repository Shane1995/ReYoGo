interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function Checkbox({ checked, indeterminate, onChange, disabled, label }: CheckboxProps) {
  const isChecked = indeterminate ? false : checked;

  const boxCls = [
    'inline-flex items-center justify-center size-[18px] rounded-[4px] border shrink-0',
    'transition-[background,border-color] duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20C997]/50',
    disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
    checked || indeterminate
      ? 'bg-[#20C997] border-[#20C997]'
      : 'bg-transparent border-white/20 hover:border-[#20C997]/50',
  ].join(' ');

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-disabled={disabled}
      disabled={disabled}
      className={label ? 'inline-flex items-center gap-2' : undefined}
      onClick={() => !disabled && onChange(!isChecked)}
    >
      <span className={boxCls}>
        {checked && !indeterminate && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {indeterminate && (
          <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
            <path d="M1 1H9" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </span>
      {label && <span className="text-sm select-none">{label}</span>}
    </button>
  );
}

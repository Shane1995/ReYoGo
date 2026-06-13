import type { CheckboxProps } from './types';
import { displayCheckedOf } from './utils/displayCheckedOf';
import { ariaCheckedOf } from './utils/ariaCheckedOf';
import { isActiveState } from './utils/isActiveState';
import { checkboxBoxClassName } from './utils/checkboxBoxClassName';
import { toggleIfEnabled } from './utils/toggleIfEnabled';
import { CheckboxIcon } from './components/CheckboxIcon';

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

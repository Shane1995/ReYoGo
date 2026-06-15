import { cn } from '@reyogo/ui';
import { ACTION_BTN_CLASS } from './constants';
import type { ActionButtonProps } from './types';

export function ActionButton({
  onClick,
  className,
  icon,
  iconClass,
  label,
  sublabel,
}: ActionButtonProps) {
  return (
    <button type="button" onClick={onClick} className={cn(ACTION_BTN_CLASS, className)}>
      <span
        className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', iconClass)}
      >
        {icon}
      </span>
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="block text-xs font-normal opacity-80">{sublabel}</span>
      </span>
    </button>
  );
}

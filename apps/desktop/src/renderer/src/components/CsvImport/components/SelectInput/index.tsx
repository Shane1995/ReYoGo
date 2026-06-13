import { cn } from '@reyogo/ui';
import type { SelectInputProps } from './types';

export function SelectInput({ value, onChange, className, children }: SelectInputProps) {
  return (
    <select
      value={value}
      onChange={(e) => {
        e.stopPropagation();
        onChange(e.target.value);
      }}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'h-7 rounded border border-input bg-background px-2 text-xs cursor-pointer shrink-0 max-w-[180px]',
        'focus:outline-none focus:ring-2 focus:ring-[var(--nav-active-border)]/50',
        className,
      )}
    >
      {children}
    </select>
  );
}

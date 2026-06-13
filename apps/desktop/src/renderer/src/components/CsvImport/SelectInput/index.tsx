import { cn } from '@reyogo/ui';

export function SelectInput({
  value,
  onChange,
  className,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
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

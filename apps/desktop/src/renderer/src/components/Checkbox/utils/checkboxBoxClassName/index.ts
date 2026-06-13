export function checkboxBoxClassName(disabled: boolean | undefined, active: boolean): string {
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

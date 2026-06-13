import type { GroupLabelProps } from './types';

export function GroupLabel({ name }: GroupLabelProps) {
  if (!name) return null;
  return (
    <>
      <span className="text-white/15 text-xs">·</span>
      <span className="text-xs font-medium text-white/45 max-w-[160px] truncate">{name}</span>
    </>
  );
}

import { cn } from '@reyogo/ui';
import { entityColor } from '../../utils/entityColor';
import { entityInitials } from '../../utils/entityInitials';
import type { EntityAvatarProps } from './types';

export function EntityAvatar({ id, name }: EntityAvatarProps) {
  const c = entityColor(id);
  return (
    <span
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold ring-1',
        c.bg,
        c.text,
        c.ring,
      )}
    >
      {entityInitials(name)}
    </span>
  );
}

import { CheckIcon } from 'lucide-react';
import { cn } from '@reyogo/ui';
import { EntityAvatar } from '../EntityAvatar';
import type { EntitySwitcherListProps } from './types';

export function EntitySwitcherList({
  entities,
  selectedEntityId,
  onSelect,
}: EntitySwitcherListProps) {
  return (
    <div className="mt-1 space-y-0.5">
      {entities.map((entity) => {
        const isActive = entity.id === selectedEntityId;
        return (
          <button
            key={entity.id}
            type="button"
            onClick={() => onSelect(entity.id)}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors',
              isActive
                ? 'bg-[var(--nav-accent)] text-[var(--nav-accent-foreground)]'
                : 'text-foreground hover:bg-muted/60',
            )}
          >
            <EntityAvatar id={entity.id} name={entity.name} />
            <span className="flex-1 truncate font-medium">{entity.name}</span>
            {isActive && <CheckIcon className="size-3 shrink-0 text-[#20C997]" />}
          </button>
        );
      })}
    </div>
  );
}

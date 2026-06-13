import { EntityAvatar } from '../EntityAvatar';
import { EntitySwitcherPopover } from '../EntitySwitcherPopover';
import type { EntitySectionProps } from './types';

export function EntitySection({
  entity,
  hasMultiple,
  entities,
  selectedEntityId,
  open,
  onOpenChange,
  onSelect,
}: EntitySectionProps) {
  if (!entity) return null;
  if (hasMultiple) {
    return (
      <EntitySwitcherPopover
        entities={entities}
        selectedEntityId={selectedEntityId}
        open={open}
        onOpenChange={onOpenChange}
        onSelect={onSelect}
      />
    );
  }
  return (
    <div className="flex h-7 items-center gap-2 px-2">
      <EntityAvatar id={entity.id} name={entity.name} />
      <span className="text-xs font-medium text-white/60">{entity.name}</span>
    </div>
  );
}

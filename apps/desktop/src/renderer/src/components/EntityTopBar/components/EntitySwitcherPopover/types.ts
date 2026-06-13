import type { Entity } from '../../types';

export type EntitySwitcherPopoverProps = {
  entities: Entity[];
  selectedEntityId: string | undefined;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (id: string) => void;
};

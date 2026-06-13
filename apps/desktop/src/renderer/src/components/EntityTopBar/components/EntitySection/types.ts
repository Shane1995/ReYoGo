import type { Entity } from '../../types';

export type EntitySectionProps = {
  entity: Entity | null;
  hasMultiple: boolean;
  entities: Entity[];
  selectedEntityId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string) => void;
};

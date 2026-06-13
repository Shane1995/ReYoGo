import type { Entity } from '../../types';

export type EntitySwitcherListProps = {
  entities: Entity[];
  selectedEntityId: string | undefined;
  onSelect: (id: string) => void;
};

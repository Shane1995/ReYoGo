import type { Entity } from '../../types';

export function selectedEntityOf(
  entities: Entity[],
  selectedEntityId: string | undefined,
): Entity | null {
  const found = entities.find((e) => e.id === selectedEntityId);
  if (found) return found;
  return entities[0] ?? null;
}

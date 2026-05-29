import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { IBusinessGroup, IEntity } from '@reyogo/types';
import { entitiesService } from '@/services/entities';

interface EntityContextValue {
  group: IBusinessGroup | null;
  entities: IEntity[];
  refetchEntities: () => Promise<void>;
}

const EntityContext = createContext<EntityContextValue | null>(null);

export function EntityProvider({ children }: { children: ReactNode }) {
  const [group, setGroup] = useState<IBusinessGroup | null>(null);
  const [entities, setEntities] = useState<IEntity[]>([]);

  const refetchEntities = useCallback(async () => {
    const [g, e] = await Promise.all([entitiesService.getGroup(), entitiesService.getEntities()]);
    setGroup(g);
    setEntities(e);
  }, []);

  useEffect(() => {
    refetchEntities().catch(console.error);
  }, [refetchEntities]);

  return (
    <EntityContext.Provider value={{ group, entities, refetchEntities }}>
      {children}
    </EntityContext.Provider>
  );
}

export function useEntities(): EntityContextValue {
  const ctx = useContext(EntityContext);
  if (!ctx) throw new Error('useEntities must be used within EntityProvider');
  return ctx;
}

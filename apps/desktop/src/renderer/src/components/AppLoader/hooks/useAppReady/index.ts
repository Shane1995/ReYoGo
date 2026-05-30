import { useCallback, useEffect, useState } from 'react';
import { appService } from '@/services/app';
import { entitiesService } from '@/services/entities';
import { cloudSyncService } from '@/services/cloudSync';

export type AppPhase = 'loading' | 'fresh-replica' | 'setup' | 'ready';

export function useAppReady() {
  const [phase, setPhase] = useState<AppPhase>('loading');
  const [initError, setInitError] = useState<string | null>(null);

  const checkSetup = useCallback(async () => {
    const isFresh = await cloudSyncService.isFreshReplica();
    if (isFresh) {
      setPhase('fresh-replica');
      return;
    }
    const state = await entitiesService.getSetupState();
    setPhase(state.setupComplete ? 'ready' : 'setup');
  }, []);

  useEffect(() => {
    appService.onAppReady(() => checkSetup().catch(console.error));
    appService.onAppInitError((message) => setInitError(message));
    appService.requestAppReady();
  }, [checkSetup]);

  const isReady = phase !== 'loading';
  const setupComplete = phase === 'ready' ? true : phase === 'setup' ? false : null;

  return { isReady, setupComplete, initError, phase };
}

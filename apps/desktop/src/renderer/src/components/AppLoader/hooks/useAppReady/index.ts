import { useCallback, useEffect, useState } from 'react';
import { appService } from '@/services/app';
import { entitiesService } from '@/services/entities';
import { cloudSyncService } from '@/services/cloudSync';
import { CloudSyncEventType } from '@shared/types/cloudSync';
import type { AppPhase } from './types';

export function useAppReady() {
  const [phase, setPhase] = useState<AppPhase>('loading');
  const [initError, setInitError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [cloudConnected, setCloudConnected] = useState(false);

  const checkSetup = useCallback(async () => {
    const isFresh = await cloudSyncService.isFreshReplica().catch(() => false);
    if (isFresh) {
      setPhase('fresh-replica');
      return;
    }
    const state = await entitiesService.getSetupState();
    setCloudConnected(true);
    setPhase(state.setupComplete ? 'ready' : 'setup');
  }, []);

  useEffect(() => {
    const offReady = appService.onAppReady(() => checkSetup().catch(console.error));
    const offError = appService.onAppInitError((message) => setInitError(message));
    const offAuthError = appService.onDbAuthError((message) => {
      setAuthError(message);
      setPhase('auth-error');
    });
    const offSetupNeeded = appService.onSetupNeeded(() => {
      setCloudConnected(false);
      setPhase('setup');
    });
    const offSyncEvent = cloudSyncService.onSyncEvent((event) => {
      if (event.type === CloudSyncEventType.Error && !event.retryable) {
        setAuthError(event.message);
        setPhase('auth-error');
      }
    });
    appService.requestAppReady();
    return () => {
      offReady();
      offError();
      offAuthError();
      offSetupNeeded();
      offSyncEvent();
    };
  }, [checkSetup]);

  const isReady = phase !== 'loading';
  const setupComplete = phase === 'ready' ? true : phase === 'setup' ? false : null;

  return { isReady, setupComplete, initError, authError, phase, cloudConnected };
}

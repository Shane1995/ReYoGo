import { useCallback, useEffect, useState } from 'react';
import { appService } from '@/services/app';
import { entitiesService } from '@/services/entities';

export function useAppReady() {
  const [isReady, setIsReady] = useState(false);
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  const checkSetup = useCallback(async () => {
    const state = await entitiesService.getSetupState();
    setSetupComplete(state.setupComplete);
    setIsReady(true);
  }, []);

  useEffect(() => {
    appService.onAppReady(() => checkSetup().catch(console.error));
    appService.onAppInitError((message) => setInitError(message));
    appService.requestAppReady();
  }, [checkSetup]);

  return { isReady, setupComplete, initError };
}

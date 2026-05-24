import { useEffect, useState } from 'react';
import { appService } from '@/services/app';

export function useAppReady() {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    appService.onAppReady(() => setIsReady(true));
    appService.onAppInitError((message) => setInitError(message));
    appService.requestAppReady();
  }, []);

  return { isReady, initError };
}

import { useEffect, useState } from 'react';
import { appService } from '@/services/app';

export function useAppReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    appService.onAppReady(() => setIsReady(true));
    appService.requestAppReady();
  }, []);

  return { isReady };
}

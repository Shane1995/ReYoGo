import { useEffect, useState } from 'react';
import { appService } from '../services/app';

export function useAutoUpdater(): { updateReady: boolean } {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    const cleanup = appService.onUpdateDownloaded(() => setUpdateReady(true));
    return cleanup;
  }, []);

  return { updateReady };
}

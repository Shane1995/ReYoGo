import { useCallback, useEffect, useState } from 'react';
import { aiSettingsService } from '@/services/aiSettings';

export function useApiKeyStatus() {
  const [configured, setConfigured] = useState(false);

  const refreshStatus = useCallback(async () => {
    const status = await aiSettingsService.getKeyStatus().catch(() => ({ configured: false }));
    setConfigured(status.configured);
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return { configured, refreshStatus };
}

import { useEffect, useState } from 'react';
import { aiSettingsService } from '@/services/aiSettings';

export function useAiConfigured(): boolean {
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    aiSettingsService
      .getKeyStatus()
      .then((s) => setConfigured(s.configured))
      .catch(() => setConfigured(false));
  }, []);

  return configured;
}

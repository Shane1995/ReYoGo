import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { aiSettingsService } from '@/services/aiSettings';
import { ipcErrorMessage } from '@/utils/ipcErrorMessage';
import type { UseClearApiKeyParams } from './types';

export function useClearApiKey({ refreshStatus }: UseClearApiKeyParams) {
  const [clearing, setClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const openClearConfirm = useCallback(() => setShowClearConfirm(true), []);
  const closeClearConfirm = useCallback(() => setShowClearConfirm(false), []);

  const handleConfirmClear = useCallback(async () => {
    setClearing(true);
    try {
      await aiSettingsService.clearKey();
      toast.success('API key removed');
      setShowClearConfirm(false);
      await refreshStatus();
    } catch (err) {
      toast.error(ipcErrorMessage(err, 'Failed to remove the API key'));
    } finally {
      setClearing(false);
    }
  }, [refreshStatus]);

  return { clearing, showClearConfirm, openClearConfirm, closeClearConfirm, handleConfirmClear };
}

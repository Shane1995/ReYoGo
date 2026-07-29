import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { aiSettingsService } from '@/services/aiSettings';
import { ipcErrorMessage } from '@/utils/ipcErrorMessage';
import { useApiKeyStatus } from './useApiKeyStatus';
import { useApiKeyTest } from './useApiKeyTest';
import { useClearApiKey } from './useClearApiKey';

export function useAISettingsSection() {
  const [saving, setSaving] = useState(false);
  const { configured, refreshStatus } = useApiKeyStatus();
  const test = useApiKeyTest();
  const clear = useClearApiKey({ refreshStatus });

  const handleSave = useCallback(async () => {
    if (!test.testResult?.success) return;
    setSaving(true);
    try {
      await aiSettingsService.setKey(test.apiKey.trim());
      toast.success('Anthropic API key saved');
      test.resetKeyInput();
      await refreshStatus();
    } catch (err) {
      toast.error(ipcErrorMessage(err, 'Failed to save the API key'));
    } finally {
      setSaving(false);
    }
  }, [test, refreshStatus]);

  return {
    configured,
    apiKey: test.apiKey,
    setApiKey: test.setApiKey,
    testing: test.testing,
    testResult: test.testResult,
    saving,
    canSave: test.testResult?.success === true && !saving,
    clearing: clear.clearing,
    showClearConfirm: clear.showClearConfirm,
    handleTestConnection: test.handleTestConnection,
    handleSave,
    openClearConfirm: clear.openClearConfirm,
    closeClearConfirm: clear.closeClearConfirm,
    handleConfirmClear: clear.handleConfirmClear,
  };
}

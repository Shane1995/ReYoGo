import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { aiSettingsService } from '@/services/aiSettings';
import { ipcErrorMessage } from '@/utils/ipcErrorMessage';
import type { TestConnectionResult } from '../../types';

export function useApiKeyTest() {
  const [apiKey, setApiKeyRaw] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestConnectionResult>(null);

  const setApiKey = useCallback((value: string) => {
    setApiKeyRaw(value);
    setTestResult(null);
  }, []);

  const resetKeyInput = useCallback(() => {
    setApiKeyRaw('');
    setTestResult(null);
  }, []);

  const handleTestConnection = useCallback(async () => {
    if (!apiKey.trim()) {
      toast.error('Enter an API key first.');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const result = await aiSettingsService.testConnection(apiKey.trim());
      setTestResult(result);
    } catch (err) {
      setTestResult({ success: false, error: ipcErrorMessage(err, 'Could not reach Anthropic.') });
    } finally {
      setTesting(false);
    }
  }, [apiKey]);

  return { apiKey, setApiKey, resetKeyInput, testing, testResult, handleTestConnection };
}

import { ipcMain } from 'electron';
import Anthropic from '@anthropic-ai/sdk';
import { AiSettingsIPC } from '@shared/types/ipc';
import { clearApiKey, hasApiKey, setApiKey } from '../../lib/anthropicKeyStore';

async function testConnection(apiKey: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const client = new Anthropic({ apiKey });
    await client.models.list({ limit: 1 });
    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not connect to Anthropic.';
    return { success: false, error: message };
  }
}

export function registerAiSettingsHandlers(): void {
  ipcMain.handle(AiSettingsIPC.SET_KEY, (_event, apiKey: string) => setApiKey(apiKey));

  ipcMain.handle(AiSettingsIPC.CLEAR_KEY, () => clearApiKey());

  ipcMain.handle(AiSettingsIPC.GET_KEY_STATUS, () => ({ configured: hasApiKey() }));

  ipcMain.handle(AiSettingsIPC.TEST_CONNECTION, (_event, apiKey: string) => testConnection(apiKey));
}

import { AiSettingsIPC } from '@shared/types/ipc';

const invoke = () => window.electronAPI.ipcRenderer.invoke;

export const aiSettingsService = {
  setKey: (apiKey: string): Promise<void> => invoke()(AiSettingsIPC.SET_KEY, apiKey),

  clearKey: (): Promise<void> => invoke()(AiSettingsIPC.CLEAR_KEY),

  getKeyStatus: (): Promise<{ configured: boolean }> => invoke()(AiSettingsIPC.GET_KEY_STATUS),

  testConnection: (apiKey: string): Promise<{ success: boolean; error: string | null }> =>
    invoke()(AiSettingsIPC.TEST_CONNECTION, apiKey),
};

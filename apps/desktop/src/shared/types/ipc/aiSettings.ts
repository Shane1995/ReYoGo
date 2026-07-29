export const AiSettingsIPC = {
  SET_KEY: 'ai-settings:set-key',
  CLEAR_KEY: 'ai-settings:clear-key',
  GET_KEY_STATUS: 'ai-settings:get-key-status',
  TEST_CONNECTION: 'ai-settings:test-connection',
} as const;

export type AiSettingsIPC = (typeof AiSettingsIPC)[keyof typeof AiSettingsIPC];

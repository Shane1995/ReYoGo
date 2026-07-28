import { describe, it, expect, vi, beforeEach } from 'vitest';

const { registeredHandlers, mockSetApiKey, mockClearApiKey, mockHasApiKey, mockModelsList } =
  vi.hoisted(() => {
    const registeredHandlers = new Map<string, (...args: unknown[]) => unknown>();
    return {
      registeredHandlers,
      mockSetApiKey: vi.fn(),
      mockClearApiKey: vi.fn(),
      mockHasApiKey: vi.fn(() => false),
      mockModelsList: vi.fn(() => Promise.resolve({})),
    };
  });

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: (...args: unknown[]) => unknown) => {
      registeredHandlers.set(channel, handler);
    }),
  },
}));

vi.mock('../../lib/anthropicKeyStore', () => ({
  setApiKey: mockSetApiKey,
  clearApiKey: mockClearApiKey,
  hasApiKey: mockHasApiKey,
}));

vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    models = { list: mockModelsList };
  },
}));

import { registerAiSettingsHandlers } from './index';

describe('registerAiSettingsHandlers', () => {
  beforeEach(() => {
    registeredHandlers.clear();
    vi.clearAllMocks();
    registerAiSettingsHandlers();
  });

  it('registers without throwing', () => {
    expect(() => registerAiSettingsHandlers()).not.toThrow();
  });

  it('set-key delegates to the key store', async () => {
    const handler = registeredHandlers.get('ai-settings:set-key')!;
    await handler(null, 'sk-ant-abc');
    expect(mockSetApiKey).toHaveBeenCalledWith('sk-ant-abc');
  });

  it('clear-key delegates to the key store', async () => {
    const handler = registeredHandlers.get('ai-settings:clear-key')!;
    await handler(null);
    expect(mockClearApiKey).toHaveBeenCalledOnce();
  });

  it('get-key-status reports configured true when a key is stored', async () => {
    mockHasApiKey.mockReturnValue(true);
    const handler = registeredHandlers.get('ai-settings:get-key-status')!;
    expect(await handler(null)).toEqual({ configured: true });
  });

  it('get-key-status reports configured false when no key is stored', async () => {
    mockHasApiKey.mockReturnValue(false);
    const handler = registeredHandlers.get('ai-settings:get-key-status')!;
    expect(await handler(null)).toEqual({ configured: false });
  });

  it('test-connection returns success when Anthropic accepts the key', async () => {
    mockModelsList.mockResolvedValue({});
    const handler = registeredHandlers.get('ai-settings:test-connection')!;
    expect(await handler(null, 'sk-ant-good')).toEqual({ success: true, error: null });
  });

  it('test-connection returns the error message when Anthropic rejects the key', async () => {
    mockModelsList.mockRejectedValue(new Error('invalid x-api-key'));
    const handler = registeredHandlers.get('ai-settings:test-connection')!;
    expect(await handler(null, 'sk-ant-bad')).toEqual({
      success: false,
      error: 'invalid x-api-key',
    });
  });
});

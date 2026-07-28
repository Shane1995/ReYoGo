import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('@/services/aiSettings', () => ({
  aiSettingsService: {
    getKeyStatus: vi.fn().mockResolvedValue({ configured: false }),
    setKey: vi.fn().mockResolvedValue(undefined),
    clearKey: vi.fn().mockResolvedValue(undefined),
    testConnection: vi.fn(),
  },
}));

import { useAISettingsSection } from './index';
import { aiSettingsService } from '@/services/aiSettings';

describe('useAISettingsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(aiSettingsService.getKeyStatus).mockResolvedValue({ configured: false });
  });

  it('cannot save before Test Connection succeeds', async () => {
    const { result } = renderHook(() => useAISettingsSection());
    await waitFor(() => expect(result.current.configured).toBe(false));

    act(() => result.current.setApiKey('sk-ant-abc'));

    expect(result.current.canSave).toBe(false);
  });

  it('allows save only after a successful Test Connection', async () => {
    vi.mocked(aiSettingsService.testConnection).mockResolvedValue({ success: true, error: null });
    const { result } = renderHook(() => useAISettingsSection());
    await waitFor(() => expect(result.current.configured).toBe(false));

    act(() => result.current.setApiKey('sk-ant-abc'));
    await act(() => result.current.handleTestConnection());

    expect(result.current.canSave).toBe(true);
  });

  it('keeps save disabled after a failed Test Connection', async () => {
    vi.mocked(aiSettingsService.testConnection).mockResolvedValue({
      success: false,
      error: 'invalid key',
    });
    const { result } = renderHook(() => useAISettingsSection());
    await waitFor(() => expect(result.current.configured).toBe(false));

    act(() => result.current.setApiKey('sk-ant-bad'));
    await act(() => result.current.handleTestConnection());

    expect(result.current.canSave).toBe(false);
    expect(result.current.testResult).toEqual({ success: false, error: 'invalid key' });
  });

  it('resets the test result whenever the key input changes', async () => {
    vi.mocked(aiSettingsService.testConnection).mockResolvedValue({ success: true, error: null });
    const { result } = renderHook(() => useAISettingsSection());
    await waitFor(() => expect(result.current.configured).toBe(false));

    act(() => result.current.setApiKey('sk-ant-abc'));
    await act(() => result.current.handleTestConnection());
    expect(result.current.canSave).toBe(true);

    act(() => result.current.setApiKey('sk-ant-abc-edited'));

    expect(result.current.canSave).toBe(false);
    expect(result.current.testResult).toBeNull();
  });

  it('does not call setKey when save is attempted without a successful test', async () => {
    const { result } = renderHook(() => useAISettingsSection());
    await waitFor(() => expect(result.current.configured).toBe(false));

    act(() => result.current.setApiKey('sk-ant-abc'));
    await act(() => result.current.handleSave());

    expect(aiSettingsService.setKey).not.toHaveBeenCalled();
  });

  it('saves the key and refreshes status after a successful test', async () => {
    vi.mocked(aiSettingsService.testConnection).mockResolvedValue({ success: true, error: null });
    vi.mocked(aiSettingsService.getKeyStatus).mockResolvedValueOnce({ configured: false });
    const { result } = renderHook(() => useAISettingsSection());
    await waitFor(() => expect(result.current.configured).toBe(false));

    act(() => result.current.setApiKey('sk-ant-abc'));
    await act(() => result.current.handleTestConnection());

    vi.mocked(aiSettingsService.getKeyStatus).mockResolvedValueOnce({ configured: true });
    await act(() => result.current.handleSave());

    expect(aiSettingsService.setKey).toHaveBeenCalledWith('sk-ant-abc');
    expect(result.current.configured).toBe(true);
    expect(result.current.apiKey).toBe('');
  });

  it('clears the key on confirm', async () => {
    const { result } = renderHook(() => useAISettingsSection());
    await waitFor(() => expect(result.current.configured).toBe(false));

    act(() => result.current.openClearConfirm());
    expect(result.current.showClearConfirm).toBe(true);

    await act(() => result.current.handleConfirmClear());

    expect(aiSettingsService.clearKey).toHaveBeenCalledOnce();
    expect(result.current.showClearConfirm).toBe(false);
  });
});

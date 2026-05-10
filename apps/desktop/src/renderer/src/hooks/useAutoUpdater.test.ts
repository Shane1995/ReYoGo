import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAutoUpdater } from './useAutoUpdater';

vi.mock('../services/app', () => ({
  appService: {
    onUpdateDownloaded: vi.fn(),
  },
}));

import { appService } from '../services/app';

describe('useAutoUpdater', () => {
  it('returns updateReady false initially', () => {
    const { result } = renderHook(() => useAutoUpdater());
    expect(result.current.updateReady).toBe(false);
  });

  it('returns updateReady true after update-downloaded fires', () => {
    let capturedCallback: (() => void) | undefined;
    vi.mocked(appService.onUpdateDownloaded).mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });

    const { result } = renderHook(() => useAutoUpdater());
    expect(result.current.updateReady).toBe(false);

    act(() => {
      capturedCallback?.();
    });

    expect(result.current.updateReady).toBe(true);
  });
});

import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import UpdateToast from './index';

vi.mock('sonner', () => ({ toast: vi.fn() }));

vi.mock('../../hooks/useAutoUpdater', () => ({
  useAutoUpdater: vi.fn(),
}));

vi.mock('../../services/app', () => ({
  appService: {
    installUpdate: vi.fn().mockResolvedValue(undefined),
  },
}));

import { useAutoUpdater } from '../../hooks/useAutoUpdater';
import { appService } from '../../services/app';

describe('UpdateToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not show toast when update is not ready', () => {
    vi.mocked(useAutoUpdater).mockReturnValue({ updateReady: false });
    render(<UpdateToast />);
    expect(toast).not.toHaveBeenCalled();
  });

  it('shows persistent toast when update is ready', () => {
    vi.mocked(useAutoUpdater).mockReturnValue({ updateReady: true });
    render(<UpdateToast />);
    expect(toast).toHaveBeenCalledWith(
      'Update ready — Restart to apply',
      expect.objectContaining({ duration: Infinity }),
    );
  });

  it('calls installUpdate when Restart now is clicked', async () => {
    vi.mocked(useAutoUpdater).mockReturnValue({ updateReady: true });
    vi.mocked(toast).mockImplementation((_msg, opts: any) => {
      opts?.action?.onClick();
      return 'toast-id';
    });
    render(<UpdateToast />);
    expect(appService.installUpdate).toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

vi.mock('@/services/aiSettings', () => ({
  aiSettingsService: {
    getKeyStatus: vi.fn().mockResolvedValue({ configured: false }),
    setKey: vi.fn(),
    clearKey: vi.fn(),
    testConnection: vi.fn(),
  },
}));

import { AISettingsSection } from './index';
import { aiSettingsService } from '@/services/aiSettings';

describe('AISettingsSection', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the section heading', async () => {
    vi.mocked(aiSettingsService.getKeyStatus).mockResolvedValue({ configured: false });

    await act(async () => {
      render(<AISettingsSection />);
    });

    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('shows the key form when not configured', async () => {
    vi.mocked(aiSettingsService.getKeyStatus).mockResolvedValue({ configured: false });

    await act(async () => {
      render(<AISettingsSection />);
    });

    expect(screen.getByText('Test Connection')).toBeInTheDocument();
  });

  it('shows the configured status when a key is already stored', async () => {
    vi.mocked(aiSettingsService.getKeyStatus).mockResolvedValue({ configured: true });

    await act(async () => {
      render(<AISettingsSection />);
    });

    expect(screen.getByText('Configured')).toBeInTheDocument();
  });
});

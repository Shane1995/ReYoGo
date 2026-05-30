import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/services/cloudSync', () => ({
  cloudSyncService: {
    getStatus: vi
      .fn()
      .mockResolvedValue({ state: 'idle', lastSyncedAt: null, error: null, isActive: false }),
    getCredentials: vi.fn().mockResolvedValue(null),
    activate: vi.fn(),
    manualSync: vi.fn(),
    deleteBackup: vi.fn(),
    onSyncEvent: vi.fn(() => () => {}),
    isFreshReplica: vi.fn().mockResolvedValue(false),
  },
}));

import { CloudSyncSection } from './index';

describe('CloudSyncSection', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the section heading', async () => {
    render(<CloudSyncSection />);
    expect(screen.getByText('Cloud Sync')).toBeInTheDocument();
  });

  it('shows the credential form when not active', async () => {
    render(<CloudSyncSection />);
    expect(await screen.findByPlaceholderText('libsql://your-db.turso.io')).toBeInTheDocument();
  });
});

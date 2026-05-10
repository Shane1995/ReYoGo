import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VersionBar from './index';

vi.mock('../../services/app', () => ({
  appService: {
    getVersion: vi.fn().mockResolvedValue({ version: '1.0.0-beta.1', env: 'staging' }),
    checkForUpdates: vi.fn().mockResolvedValue({ hasUpdate: false }),
    onUpdateError: vi.fn().mockReturnValue(() => {}),
  },
}));

describe('VersionBar', () => {
  it('renders version and capitalised environment', async () => {
    render(<VersionBar />);
    expect(await screen.findByText('v1.0.0-beta.1 • Staging')).toBeInTheDocument();
  });

  it('renders nothing while loading', () => {
    render(<VersionBar />);
    expect(screen.queryByText(/v\d/)).not.toBeInTheDocument();
  });
});

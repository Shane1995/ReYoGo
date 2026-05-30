import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/services/app', () => ({
  appService: {
    getVersion: vi.fn().mockResolvedValue({ version: '1.2.3' }),
    checkForUpdates: vi.fn().mockResolvedValue({ hasUpdate: false }),
    onUpdateError: vi.fn(() => () => {}),
    installUpdate: vi.fn(),
    onUpdateDownloaded: vi.fn(() => () => {}),
  },
}));

import { AboutSection } from './index';

describe('AboutSection', () => {
  it('renders the section heading', () => {
    render(<AboutSection />);
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('shows the version once loaded', async () => {
    render(<AboutSection />);
    expect(await screen.findByText(/v1\.2\.3/)).toBeInTheDocument();
  });
});

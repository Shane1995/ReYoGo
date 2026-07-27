import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppConfigProvider } from '@/Context';
import { AppSidebar } from './index';

vi.mock('@/services/cloudSync', () => ({
  cloudSyncService: {
    getStatus: vi
      .fn()
      .mockResolvedValue({ state: 'idle', lastSyncedAt: null, error: null, isActive: false }),
    onSyncEvent: vi.fn(() => () => {}),
  },
}));

vi.mock('@/services/app', () => ({
  appService: {
    getVersion: vi.fn().mockResolvedValue({ version: '0.0.0', env: 'development' }),
    checkForUpdates: vi.fn().mockResolvedValue({ hasUpdate: false }),
    onUpdateError: vi.fn().mockReturnValue(() => {}),
  },
}));

vi.mock('@/Context/EntityContext', () => ({
  useEntities: () => ({
    group: { id: 'g1', name: 'Test Group' },
    entities: [],
    refetchEntities: vi.fn(),
  }),
  EntityProvider: ({ children }: { children: React.ReactNode }) => children,
}));

function renderSidebar() {
  return render(
    <AppConfigProvider>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppSidebar />
      </MemoryRouter>
    </AppConfigProvider>,
  );
}

describe('AppSidebar', () => {
  beforeEach(() => localStorage.clear());

  it('renders all four nav items when expanded', () => {
    renderSidebar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('Invoices')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('hides nav labels after collapsing', async () => {
    renderSidebar();
    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    await waitFor(() => {
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
  });

  it('shows the Expand button after collapsing', async () => {
    renderSidebar();
    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
  });

  it('persists collapsed state to localStorage', async () => {
    renderSidebar();
    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(localStorage.getItem('sidebar-primary-collapsed')).toBe('true');
  });

  it('restores collapsed state from localStorage on mount', () => {
    localStorage.setItem('sidebar-primary-collapsed', 'true');
    renderSidebar();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AppLoader from './index';
import { useAppReady } from './hooks/useAppReady';
import type { AppPhase } from './hooks/useAppReady/types';

vi.mock('./hooks/useAppReady', () => ({
  useAppReady: vi.fn(),
}));

vi.mock('./InitErrorScreen', () => ({
  InitErrorScreen: ({ error }: { error: string }) => <div data-testid="init-error">{error}</div>,
}));

vi.mock('./ReconnectModal', () => ({
  ReconnectModal: ({ authError }: { authError: string | null }) => (
    <div data-testid="reconnect-modal">{authError}</div>
  ),
}));

vi.mock('./components/AppShell', () => ({
  AppShell: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

vi.mock('./components/AppContent', () => ({
  AppContent: () => <div data-testid="app-content" />,
}));

function mockUseAppReady(overrides: {
  phase: AppPhase;
  setupComplete?: boolean | null;
  initError?: string | null;
  authError?: string | null;
  cloudConnected?: boolean;
}) {
  vi.mocked(useAppReady).mockReturnValue({
    isReady: overrides.phase !== 'loading',
    setupComplete: overrides.setupComplete ?? null,
    initError: overrides.initError ?? null,
    authError: overrides.authError ?? null,
    phase: overrides.phase,
    cloudConnected: overrides.cloudConnected ?? false,
  });
}

describe('AppLoader', () => {
  it('renders InitErrorScreen when initError is set', () => {
    mockUseAppReady({ phase: 'loading', initError: 'boom' });
    render(<AppLoader />);
    expect(screen.getByTestId('init-error')).toHaveTextContent('boom');
  });

  it('renders ReconnectModal inside AppShell when phase is auth-error', () => {
    mockUseAppReady({ phase: 'auth-error', authError: 'unauthorized' });
    render(<AppLoader />);
    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(screen.getByTestId('reconnect-modal')).toHaveTextContent('unauthorized');
  });

  it('delegates to AppContent for other phases', () => {
    mockUseAppReady({ phase: 'ready', setupComplete: true });
    render(<AppLoader />);
    expect(screen.getByTestId('app-content')).toBeInTheDocument();
  });
});

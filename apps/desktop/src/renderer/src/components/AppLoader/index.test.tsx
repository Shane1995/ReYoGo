import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AppLoader from './index';
import { useAppReady } from './hooks/useAppReady';
import { setupWizardStepOf } from './utils/setupWizardStepOf';
import type { AppPhase } from './hooks/useAppReady/types';

vi.mock('./hooks/useAppReady', () => ({
  useAppReady: vi.fn(),
}));

vi.mock('./utils/setupWizardStepOf', () => ({
  setupWizardStepOf: vi.fn(() => 1),
}));

vi.mock('@/pages/SetupWizard', () => ({
  default: ({ initialStep }: { initialStep: number }) => (
    <div data-testid="setup-wizard">{initialStep}</div>
  ),
}));

vi.mock('./LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}));

vi.mock('./FreshReplicaScreen', () => ({
  FreshReplicaScreen: () => <div data-testid="fresh-replica" />,
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

  it('renders LoadingSpinner when phase is loading', () => {
    mockUseAppReady({ phase: 'loading' });
    render(<AppLoader />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders FreshReplicaScreen when phase is fresh-replica', () => {
    mockUseAppReady({ phase: 'fresh-replica' });
    render(<AppLoader />);
    expect(screen.getByTestId('fresh-replica')).toBeInTheDocument();
  });

  it('renders SetupWizard with the resolved step when setup is incomplete', () => {
    vi.mocked(setupWizardStepOf).mockReturnValue(2);
    mockUseAppReady({ phase: 'setup', setupComplete: false, cloudConnected: true });
    render(<AppLoader />);
    expect(screen.getByTestId('setup-wizard')).toHaveTextContent('2');
    expect(setupWizardStepOf).toHaveBeenCalledWith(true);
  });

  it('renders AppShell when setup is complete', () => {
    mockUseAppReady({ phase: 'ready', setupComplete: true });
    render(<AppLoader />);
    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
  });
});

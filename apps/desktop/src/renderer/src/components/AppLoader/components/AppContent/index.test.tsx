import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppContent } from './index';
import { setupWizardStepOf } from '../../utils/setupWizardStepOf';

vi.mock('../../utils/setupWizardStepOf', () => ({
  setupWizardStepOf: vi.fn(() => 1),
}));

vi.mock('@/pages/SetupWizard', () => ({
  default: ({ initialStep }: { initialStep: number }) => (
    <div data-testid="setup-wizard">{initialStep}</div>
  ),
}));

vi.mock('../../LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}));

vi.mock('../../FreshReplicaScreen', () => ({
  FreshReplicaScreen: () => <div data-testid="fresh-replica" />,
}));

vi.mock('../AppShell', () => ({
  AppShell: () => <div data-testid="app-shell" />,
}));

describe('AppContent', () => {
  it('renders LoadingSpinner when phase is loading', () => {
    render(<AppContent phase="loading" setupComplete={null} cloudConnected={false} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders FreshReplicaScreen when phase is fresh-replica', () => {
    render(<AppContent phase="fresh-replica" setupComplete={null} cloudConnected={false} />);
    expect(screen.getByTestId('fresh-replica')).toBeInTheDocument();
  });

  it('renders SetupWizard with the resolved step when setup is incomplete', () => {
    vi.mocked(setupWizardStepOf).mockReturnValue(2);
    render(<AppContent phase="setup" setupComplete={false} cloudConnected={true} />);
    expect(screen.getByTestId('setup-wizard')).toHaveTextContent('2');
    expect(setupWizardStepOf).toHaveBeenCalledWith(true);
  });

  it('renders AppShell when setup is complete', () => {
    render(<AppContent phase="ready" setupComplete={true} cloudConnected={true} />);
    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
  });
});

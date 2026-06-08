import type { ReactNode } from 'react';
import AppRoutes from '@/components/AppRoutes';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import SetupWizard from '@/pages/SetupWizard';
import { LoadingSpinner } from './LoadingSpinner';
import { FreshReplicaScreen } from './FreshReplicaScreen';
import { useAppReady } from './hooks/useAppReady';
import type { AppPhase } from './hooks/useAppReady';
import { EntityProvider } from '@/Context/EntityContext';
import { ReconnectModal } from './ReconnectModal';
import { InitErrorScreen } from './InitErrorScreen';

function AppShell({ children }: { children?: ReactNode }) {
  return (
    <EntityProvider>
      <ErrorBoundary>
        <AppRoutes />
        {children}
      </ErrorBoundary>
    </EntityProvider>
  );
}

const PHASE_SCREENS: Partial<Record<AppPhase, ReactNode>> = {
  loading: <LoadingSpinner />,
  'fresh-replica': <FreshReplicaScreen />,
};

function phaseScreen(
  phase: AppPhase,
  initError: string | null,
  authError: string | null,
): ReactNode | null {
  if (initError) return <InitErrorScreen error={initError} />;
  if (phase === 'auth-error') {
    return (
      <AppShell>
        <ReconnectModal authError={authError} />
      </AppShell>
    );
  }
  return PHASE_SCREENS[phase] ?? null;
}

function setupWizardStepOf(cloudConnected: boolean): 1 | 2 {
  if (cloudConnected) return 2;
  return 1;
}

const AppLoader = () => {
  const { setupComplete, initError, authError, phase, cloudConnected } = useAppReady();

  const screen = phaseScreen(phase, initError, authError);
  if (screen) return screen;

  if (!setupComplete) return <SetupWizard initialStep={setupWizardStepOf(cloudConnected)} />;

  return <AppShell />;
};

export default AppLoader;

import AppRoutes from '@/components/AppRoutes';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import SetupWizard from '@/pages/SetupWizard';
import { LoadingSpinner } from './LoadingSpinner';
import { FreshReplicaScreen } from './FreshReplicaScreen';
import { useAppReady } from './hooks/useAppReady';
import { EntityProvider } from '@/Context/EntityContext';
import { ReconnectModal } from './ReconnectModal';
import { InitErrorScreen } from './InitErrorScreen';

const AppLoader = () => {
  const { setupComplete, initError, authError, phase, cloudConnected } = useAppReady();

  if (initError) return <InitErrorScreen error={initError} />;

  if (phase === 'loading') return <LoadingSpinner />;

  if (phase === 'fresh-replica') return <FreshReplicaScreen />;

  if (phase === 'auth-error') {
    return (
      <EntityProvider>
        <ErrorBoundary>
          <AppRoutes />
          <ReconnectModal authError={authError} />
        </ErrorBoundary>
      </EntityProvider>
    );
  }

  if (!setupComplete) return <SetupWizard initialStep={cloudConnected ? 2 : 1} />;

  return (
    <EntityProvider>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </EntityProvider>
  );
};

export default AppLoader;

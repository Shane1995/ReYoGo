import SetupWizard from '@/pages/SetupWizard';
import { LoadingSpinner } from './LoadingSpinner';
import { FreshReplicaScreen } from './FreshReplicaScreen';
import { InitErrorScreen } from './InitErrorScreen';
import { ReconnectModal } from './ReconnectModal';
import { useAppReady } from './hooks/useAppReady';
import { AppShell } from './components/AppShell';
import { setupWizardStepOf } from './utils/setupWizardStepOf';

const AppLoader = () => {
  const { setupComplete, initError, authError, phase, cloudConnected } = useAppReady();

  if (initError) return <InitErrorScreen error={initError} />;

  if (phase === 'auth-error') {
    return (
      <AppShell>
        <ReconnectModal authError={authError} />
      </AppShell>
    );
  }

  if (phase === 'loading') return <LoadingSpinner />;
  if (phase === 'fresh-replica') return <FreshReplicaScreen />;

  if (!setupComplete) return <SetupWizard initialStep={setupWizardStepOf(cloudConnected)} />;

  return <AppShell />;
};

export default AppLoader;

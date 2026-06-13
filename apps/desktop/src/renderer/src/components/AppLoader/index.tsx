import { InitErrorScreen } from './InitErrorScreen';
import { ReconnectModal } from './ReconnectModal';
import { useAppReady } from './hooks/useAppReady';
import { AppShell } from './components/AppShell';
import { AppContent } from './components/AppContent';

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

  return <AppContent phase={phase} setupComplete={setupComplete} cloudConnected={cloudConnected} />;
};

export default AppLoader;

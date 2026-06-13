import SetupWizard from '@/pages/SetupWizard';
import { LoadingSpinner } from '../../LoadingSpinner';
import { FreshReplicaScreen } from '../../FreshReplicaScreen';
import { AppShell } from '../AppShell';
import { setupWizardStepOf } from '../../utils/setupWizardStepOf';
import type { AppContentProps } from './types';

export function AppContent({ phase, setupComplete, cloudConnected }: AppContentProps) {
  if (phase === 'loading') return <LoadingSpinner />;
  if (phase === 'fresh-replica') return <FreshReplicaScreen />;
  if (!setupComplete) return <SetupWizard initialStep={setupWizardStepOf(cloudConnected)} />;
  return <AppShell />;
}

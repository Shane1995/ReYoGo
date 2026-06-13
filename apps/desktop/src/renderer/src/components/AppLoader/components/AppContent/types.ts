import type { AppPhase } from '../../hooks/useAppReady/types';

export type AppContentProps = {
  phase: AppPhase;
  setupComplete: boolean | null;
  cloudConnected: boolean;
};

import { Spinner } from '@reyogo/ui';
import type { LoadingPhaseProps } from './types';

export function LoadingPhase({ state }: LoadingPhaseProps) {
  if (state.phase !== 'loading') return null;
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-sm text-muted-foreground">
      <Spinner className="size-6" />
      {state.label}
    </div>
  );
}

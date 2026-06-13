import { Button } from '@reyogo/ui';
import type { PageState } from '../../types';

export function ErrorPhase({ state, onRetry }: { state: PageState; onRetry: () => void }) {
  if (state.phase !== 'error') return null;
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {state.message}
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

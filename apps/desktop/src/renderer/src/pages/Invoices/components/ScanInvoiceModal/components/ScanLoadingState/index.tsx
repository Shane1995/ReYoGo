import { Spinner } from '@reyogo/ui';
import { LOADING_COPY } from './constants';
import type { ScanLoadingStateProps } from './types';

export function ScanLoadingState({ variant }: ScanLoadingStateProps) {
  const copy = LOADING_COPY[variant];

  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <Spinner className="size-8" />
      <div>
        <p className="text-base font-semibold text-foreground">{copy.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{copy.description}</p>
      </div>
    </div>
  );
}

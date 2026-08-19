import { useEffect, useState } from 'react';
import type { UseCancellableFetchDeps } from './types';

export function useCancellableFetch<T>(
  fetcher: () => Promise<T>,
  onSuccess: (result: T) => void,
  onError: () => void,
  deps: UseCancellableFetchDeps,
): boolean {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetcher()
      .then((result) => {
        if (!cancelled) onSuccess(result);
      })
      .catch(() => {
        if (!cancelled) onError();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return loading;
}

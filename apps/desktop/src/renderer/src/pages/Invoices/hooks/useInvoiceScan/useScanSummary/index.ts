import { useCallback, useEffect, useState } from 'react';
import type { LastScanSummary } from '../types';

export function useScanSummary() {
  const [lastSummary, setLastSummary] = useState<LastScanSummary | null>(null);

  useEffect(() => {
    return () => {
      if (lastSummary?.previewUrl) URL.revokeObjectURL(lastSummary.previewUrl);
    };
  }, [lastSummary?.previewUrl]);

  const clearSummary = useCallback(() => setLastSummary(null), []);

  return { lastSummary, setLastSummary, clearSummary };
}

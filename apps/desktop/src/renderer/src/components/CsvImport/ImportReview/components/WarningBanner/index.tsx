import { AlertTriangleIcon } from 'lucide-react';
import type { WarningBannerProps } from './types';

export function WarningBanner({ message, detail }: WarningBannerProps) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3 text-sm">
      <AlertTriangleIcon className="size-4 shrink-0 text-amber-600 mt-0.5" />
      <div className="text-amber-800">
        <span className="font-medium">{message}</span> {detail}
      </div>
    </div>
  );
}

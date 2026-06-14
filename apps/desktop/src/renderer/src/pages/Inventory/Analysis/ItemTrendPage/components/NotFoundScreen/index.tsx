import { ArrowLeftIcon } from 'lucide-react';
import type { NotFoundScreenProps } from './types';

export function NotFoundScreen({ onBack }: NotFoundScreenProps) {
  return (
    <div className="p-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        Back to analysis
      </button>
      <p className="text-muted-foreground">Item not found.</p>
    </div>
  );
}

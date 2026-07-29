import { Badge } from '@reyogo/ui';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { TestConnectionResult } from '../../../../types';

export function TestResultBadge({ testResult }: { testResult: TestConnectionResult }) {
  if (!testResult) return null;
  if (testResult.success) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-emerald-300 text-emerald-700 dark:border-emerald-700/60 dark:text-emerald-400"
      >
        <CheckCircle2 className="size-3" /> Connection verified
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="gap-1">
      <XCircle className="size-3" /> {testResult.error ?? 'Connection failed'}
    </Badge>
  );
}

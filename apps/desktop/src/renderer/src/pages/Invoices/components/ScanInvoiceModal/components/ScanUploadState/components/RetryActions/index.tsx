import { Button } from '@reyogo/ui';
import type { RetryActionsProps } from './types';

export function RetryActions({ onChooseDifferentFile, onConfirmScan }: RetryActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="ghost" onClick={onChooseDifferentFile}>
        Choose different file
      </Button>
      <Button onClick={onConfirmScan}>Try again</Button>
    </div>
  );
}

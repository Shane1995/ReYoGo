import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@reyogo/ui';
import { formatZAR } from '@/utils/format';
import type { CompleteCountDialogProps } from './types';

export function CompleteCountDialog({
  open,
  completing,
  uncountedCount,
  totalValue,
  onClose,
  onConfirm,
}: CompleteCountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete stock count?</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            This will value the count at{' '}
            <span className="font-semibold text-foreground">{formatZAR(totalValue)}</span> and feed
            it into your stock valuation reports. Completed counts can&apos;t be edited.
          </p>
          {uncountedCount > 0 && (
            <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950 dark:text-amber-400">
              {uncountedCount} items have not been counted and will be treated as zero on hand.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={completing}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={completing}>
            {completing ? 'Completing…' : 'Complete Count'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Button } from '@reyogo/ui';
import { Link } from 'react-router-dom';
import { RotateCcwIcon } from 'lucide-react';
import { InvoiceRoutes } from '@/components/AppRoutes/routePaths';
import { ScanInvoiceButton } from '../../../ScanInvoiceButton';
import type { HeaderActionsProps } from './types';

export function HeaderActions({
  isDirty,
  onClear,
  scanConfigured,
  onScanInvoice,
  onAddCategory,
  onAddItem,
}: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {isDirty && (
        <>
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <RotateCcwIcon className="size-3" />
            Clear
          </button>
          <div className="h-4 w-px bg-border" />
        </>
      )}
      <Button asChild variant="ghost" size="sm">
        <Link to={InvoiceRoutes.History}>History</Link>
      </Button>
      <div className="h-4 w-px bg-border" />
      <ScanInvoiceButton configured={scanConfigured} onClick={onScanInvoice} />
      <div className="h-4 w-px bg-border" />
      <Button type="button" variant="outline" size="sm" onClick={onAddCategory}>
        + Category
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={onAddItem}>
        + Item
      </Button>
    </div>
  );
}

import { type ComponentProps } from 'react';
import { Link } from 'react-router-dom';
import { Button, PageHeader } from '@reyogo/ui';
import { ReceiptIcon } from 'lucide-react';
import { InvoiceRoutes } from '@/components/AppRoutes/routePaths';
import { InvoiceFilterBar } from '../InvoiceFilterBar';

type HistoryHeaderProps = {
  filterBarProps: ComponentProps<typeof InvoiceFilterBar>;
};

export function HistoryHeader({ filterBarProps }: HistoryHeaderProps) {
  return (
    <PageHeader
      title="Invoice History"
      description="Past captured invoices. Click a row to expand details, or edit with full audit trail."
      actions={
        <Button asChild size="sm">
          <Link to={InvoiceRoutes.Base} className="inline-flex items-center gap-2">
            <ReceiptIcon className="size-4" aria-hidden />
            Capture new
          </Link>
        </Button>
      }
    >
      <InvoiceFilterBar {...filterBarProps} />
    </PageHeader>
  );
}

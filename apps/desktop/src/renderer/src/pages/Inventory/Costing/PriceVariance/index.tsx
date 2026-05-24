import { PageHeader } from '@reyogo/ui';

export default function PriceVariancePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Price Variance"
        description="Alerts and trends for items whose unit cost has shifted — coming soon."
      />
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Price variance alerts will appear here.
      </div>
    </div>
  );
}

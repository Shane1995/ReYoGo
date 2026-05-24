import { PageHeader } from '@reyogo/ui';

export default function CostReportPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Cost Report"
        description="Periodic cost breakdown and export — coming soon."
      />
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Cost period reports will appear here.
      </div>
    </div>
  );
}

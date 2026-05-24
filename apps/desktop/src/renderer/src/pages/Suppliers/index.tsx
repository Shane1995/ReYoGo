import { TruckIcon } from 'lucide-react';
import { PageHeader } from '@reyogo/ui';

export default function SuppliersPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader title="Suppliers" />
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <TruckIcon className="size-10 text-[var(--muted-foreground)]/40" aria-hidden />
        <p className="text-sm font-medium text-[var(--foreground)]">No suppliers yet</p>
        <p className="text-xs text-[var(--muted-foreground)]">Supplier management coming soon.</p>
      </div>
    </div>
  );
}

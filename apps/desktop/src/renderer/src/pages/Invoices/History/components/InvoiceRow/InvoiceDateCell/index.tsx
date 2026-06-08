import { TableCell } from '@reyogo/ui';
import type { ICapturedInvoice, ICapturedInvoiceWithLines, Supplier } from '@reyogo/types';
import { formatDate } from '../../../../utils/formatDate';

type Props = {
  inv: ICapturedInvoice;
  isCreditNote: boolean;
  suppliers: Supplier[];
  detailCache: Record<string, ICapturedInvoiceWithLines>;
};

function SupplierHint({ inv, suppliers }: { inv: ICapturedInvoice; suppliers: Supplier[] }) {
  if (!inv.supplierId || suppliers.length === 0) return null;
  return (
    <p className="text-[11px] text-muted-foreground/50 mt-0.5">
      {suppliers.find((s) => s.id === inv.supplierId)?.name}
    </p>
  );
}

function CreditNoteHint({
  inv,
  isCreditNote,
  detailCache,
}: {
  inv: ICapturedInvoice;
  isCreditNote: boolean;
  detailCache: Record<string, ICapturedInvoiceWithLines>;
}) {
  if (!isCreditNote) return null;
  if (!inv.sourceInvoiceId) return null;
  const cached = detailCache[inv.sourceInvoiceId];
  const label = cached ? cached.invoiceNumber : inv.sourceInvoiceId;
  return <p className="text-[11px] text-rose-500/70 mt-0.5">CN of {label}</p>;
}

export function InvoiceDateCell({ inv, isCreditNote, suppliers, detailCache }: Props) {
  return (
    <TableCell className="text-sm text-muted-foreground">
      {inv.invoiceDate ? formatDate(inv.invoiceDate) : formatDate(inv.createdAt)}
      <SupplierHint inv={inv} suppliers={suppliers} />
      <CreditNoteHint inv={inv} isCreditNote={isCreditNote} detailCache={detailCache} />
    </TableCell>
  );
}

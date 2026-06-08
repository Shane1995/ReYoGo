import { useState, useEffect } from 'react';
import { XIcon, ClockIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { invoiceService } from '@/services/invoice';
import type { ICapturedInvoiceAuditEntry } from '@reyogo/types';
import type { Supplier } from '@reyogo/types';
import { formatDate } from '../../../utils/formatDate';

type Props = {
  invoiceId: string;
  suppliers: Supplier[];
  onClose: () => void;
};

function MetaRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-mono">{value ?? <span className="opacity-40 italic">—</span>}</span>
    </div>
  );
}

function supplierNameOf(supplierId: string | null, suppliers: Supplier[]): string | null {
  if (!supplierId) return null;
  const found = suppliers.find((s) => s.id === supplierId);
  if (found) return found.name;
  return supplierId;
}

function invoiceDateLabelOf(invoiceDate: Date | null | undefined): string | null {
  if (!invoiceDate) return null;
  return formatDate(invoiceDate);
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  if (isOpen) return <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />;
  return <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" />;
}

function NoteLabel({ note }: { note: string | null | undefined }) {
  if (!note) return null;
  return <span className="text-muted-foreground truncate">— {note}</span>;
}

function AuditEntry({
  entry,
  suppliers,
  isOpen,
  onToggle,
}: {
  entry: ICapturedInvoiceAuditEntry;
  suppliers: Supplier[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const snap = entry.snapshot;
  const supplierName = supplierNameOf(snap.supplierId, suppliers);
  return (
    <div className="rounded-md border border-[var(--nav-border)] overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/30"
      >
        <ChevronIcon isOpen={isOpen} />
        <span className="font-medium">{formatDate(entry.editedAt)}</span>
        <NoteLabel note={entry.note} />
      </button>
      {isOpen && (
        <div className="border-t border-[var(--nav-border)]/60 bg-muted/10 px-3 py-2.5 space-y-1.5">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-2">
            Before this edit
          </p>
          <MetaRow label="Supplier" value={supplierName} />
          <MetaRow label="Invoice number" value={snap.invoiceNumber} />
          <MetaRow label="Invoice date" value={invoiceDateLabelOf(snap.invoiceDate)} />
        </div>
      )}
    </div>
  );
}

export function AuditPanel({ invoiceId, suppliers, onClose }: Props) {
  const [entries, setEntries] = useState<ICapturedInvoiceAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await invoiceService.getInvoiceAudit(invoiceId);
        if (!cancelled) setEntries(result);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [invoiceId]);

  return (
    <div className="border-t border-[var(--nav-border)] bg-muted/5">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--nav-border)]/60">
        <span className="text-sm font-medium flex items-center gap-1.5">
          <ClockIcon className="size-3.5 text-muted-foreground" />
          Edit history
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <XIcon className="size-4" />
        </button>
      </div>
      <div className="px-4 py-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No edits recorded for this invoice.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((entry) => (
              <AuditEntry
                key={entry.id}
                entry={entry}
                suppliers={suppliers}
                isOpen={expanded === entry.id}
                onToggle={() => setExpanded(expanded === entry.id ? null : entry.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

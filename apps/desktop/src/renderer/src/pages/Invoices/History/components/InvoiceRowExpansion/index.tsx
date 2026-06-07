import { TableCell, TableRow } from '@reyogo/ui';
import type {
  ICapturedInvoice,
  ICapturedInvoiceWithLines,
  ISaveCreditNotePayload,
  Supplier,
} from '@reyogo/types';
import { RowModeKind, type RowMode } from '../../types';
import { EditPanel } from '../EditPanel';
import { MetadataEditPanel } from '../MetadataEditPanel';
import { AuditPanel } from '../AuditPanel';
import { RaiseCreditNotePanel } from '../RaiseCreditNotePanel';
import { InvoiceDetailLines } from '../InvoiceDetailLines';
import type { ProcessReceiptLine } from '../../../types';

const COLUMN_COUNT = 10;

type Props = {
  inv: ICapturedInvoice;
  modeKind: RowModeKind;
  detail: ICapturedInvoiceWithLines | undefined;
  suppliers: Supplier[];
  onSaveEdit: (inv: ICapturedInvoice, lines: ProcessReceiptLine[], note: string) => Promise<void>;
  onMetadataSave: (
    id: string,
    fields: {
      supplierId: string | null;
      invoiceNumber: string;
      invoiceDate: Date | null;
      note: string;
    },
  ) => Promise<void>;
  onSaveCreditNote: (payload: ISaveCreditNotePayload) => void;
  onSetMode: (id: string, mode: RowMode) => void;
};

export function InvoiceRowExpansion({
  inv,
  modeKind,
  detail,
  suppliers,
  onSaveEdit,
  onMetadataSave,
  onSaveCreditNote,
  onSetMode,
}: Props) {
  const cancelView = () => onSetMode(inv.id, { kind: RowModeKind.View });

  if (modeKind === RowModeKind.Detail && detail) {
    return (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={COLUMN_COUNT} className="p-0">
          <div className="border-t border-[var(--nav-border)] bg-[var(--nav-accent)]/30 px-6 py-4">
            <InvoiceDetailLines invoice={detail} />
          </div>
        </TableCell>
      </TableRow>
    );
  }

  if (modeKind === RowModeKind.Edit && detail) {
    return (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={COLUMN_COUNT} className="p-0">
          <EditPanel
            invoice={detail}
            onSave={(lines, note) => onSaveEdit(inv, lines, note)}
            onCancel={cancelView}
          />
        </TableCell>
      </TableRow>
    );
  }

  if (modeKind === RowModeKind.MetadataEdit && detail) {
    return (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={COLUMN_COUNT} className="p-0">
          <MetadataEditPanel
            invoice={detail}
            suppliers={suppliers}
            onSave={(fields) => onMetadataSave(inv.id, fields)}
            onCancel={cancelView}
          />
        </TableCell>
      </TableRow>
    );
  }

  if (modeKind === RowModeKind.Audit) {
    return (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={COLUMN_COUNT} className="p-0">
          <AuditPanel invoiceId={inv.id} suppliers={suppliers} onClose={cancelView} />
        </TableCell>
      </TableRow>
    );
  }

  if (modeKind === RowModeKind.CreditNote && detail) {
    return (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={COLUMN_COUNT} className="p-0">
          <RaiseCreditNotePanel
            invoice={detail}
            onConfirm={onSaveCreditNote}
            onCancel={cancelView}
          />
        </TableCell>
      </TableRow>
    );
  }

  return null;
}

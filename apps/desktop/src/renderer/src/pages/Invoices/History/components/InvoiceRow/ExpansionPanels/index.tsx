import type { ReactNode } from 'react';
import { TableCell, TableRow } from '@reyogo/ui';
import type {
  ICapturedInvoice,
  ICapturedInvoiceWithLines,
  ISaveCreditNotePayload,
  Supplier,
} from '@reyogo/types';
import { RowModeKind } from '../../../types';
import { EditPanel } from '../../EditPanel';
import { MetadataEditPanel } from '../../MetadataEditPanel';
import { AuditPanel } from '../../AuditPanel';
import { RaiseCreditNotePanel } from '../../RaiseCreditNotePanel';
import { InvoiceDetailLines } from '../../InvoiceDetailLines';
import type { ProcessReceiptLine } from '../../../../types';

const COLUMN_COUNT = 10;

type PanelContext = {
  inv: ICapturedInvoice;
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
  cancelView: () => void;
};

const PANEL_RENDERERS: Record<RowModeKind, (ctx: PanelContext) => ReactNode | null> = {
  [RowModeKind.View]: () => null,
  [RowModeKind.Detail]: ({ detail }) =>
    detail ? (
      <div className="border-t border-[var(--nav-border)] bg-[var(--nav-accent)]/30 px-6 py-4">
        <InvoiceDetailLines invoice={detail} />
      </div>
    ) : null,
  [RowModeKind.Edit]: ({ inv, detail, onSaveEdit, cancelView }) =>
    detail ? (
      <EditPanel
        invoice={detail}
        onSave={(lines, note) => onSaveEdit(inv, lines, note)}
        onCancel={cancelView}
      />
    ) : null,
  [RowModeKind.MetadataEdit]: ({ inv, detail, suppliers, onMetadataSave, cancelView }) =>
    detail ? (
      <MetadataEditPanel
        invoice={detail}
        suppliers={suppliers}
        onSave={(fields) => onMetadataSave(inv.id, fields)}
        onCancel={cancelView}
      />
    ) : null,
  [RowModeKind.Audit]: ({ inv, suppliers, cancelView }) => (
    <AuditPanel invoiceId={inv.id} suppliers={suppliers} onClose={cancelView} />
  ),
  [RowModeKind.CreditNote]: ({ detail, onSaveCreditNote, cancelView }) =>
    detail ? (
      <RaiseCreditNotePanel invoice={detail} onConfirm={onSaveCreditNote} onCancel={cancelView} />
    ) : null,
};

type Props = PanelContext & { modeKind: RowModeKind };

export function ExpansionPanels({ modeKind, ...ctx }: Props) {
  const content = PANEL_RENDERERS[modeKind](ctx);
  if (!content) return null;

  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={COLUMN_COUNT} className="p-0">
        {content}
      </TableCell>
    </TableRow>
  );
}

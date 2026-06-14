import type { IEntity, VatMode } from '@reyogo/types';
import type { ProcessReceiptLine } from '../../types';

export type SubmitMessages = { success: string; failure: string };

export type UseInvoiceSubmissionParams = {
  selectedEntity: IEntity | null;
  entityId: string;
  supplierId: string;
  invoiceNumber: string;
  invoiceDate: string;
  vatMode: VatMode;
  validLines: ProcessReceiptLine[];
  itemMetaMap: Map<string, { name: string }>;
  canSave: boolean;
  onSaved: () => void;
};

export type Summary = {
  lineCount: number;
  subtotal: number;
  totalVat: number;
  grandTotal: number;
};

export type InvoiceSummaryFooterProps = {
  summary: Summary;
  isSaving: boolean;
  isSavingDraft: boolean;
  canSave: boolean;
  isDirty: boolean;
  onSave: () => void;
  onSaveDraft: () => void;
};

export type SelectionBarProps = {
  selectedCount: number;
  confirmBulkDelete: boolean;
  onAddToInvoice: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onClear: () => void;
};

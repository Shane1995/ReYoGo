export type CompleteCountDialogProps = {
  open: boolean;
  completing: boolean;
  uncountedCount: number;
  totalValue: number;
  onClose: () => void;
  onConfirm: () => void;
};

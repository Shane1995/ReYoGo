import type { ScanStatus } from '../../hooks/useInvoiceScan/types';

export type ScanInvoiceModalProps = {
  open: boolean;
  status: ScanStatus;
  errorMessage: string;
  selectedFile: File | null;
  previewUrl: string | null;
  onClose: () => void;
  onFileSelected: (file: File) => void;
  onConfirmScan: () => void;
  onChooseDifferentFile: () => void;
};

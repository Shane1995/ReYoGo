export type ScanUploadStateProps = {
  showError: boolean;
  errorMessage: string;
  canRetry: boolean;
  onClose: () => void;
  onFileSelected: (file: File) => void;
  onConfirmScan: () => void;
  onChooseDifferentFile: () => void;
};

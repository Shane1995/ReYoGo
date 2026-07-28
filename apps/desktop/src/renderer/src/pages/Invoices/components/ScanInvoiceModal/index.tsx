import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@reyogo/ui';
import { ScanLoadingState } from './components/ScanLoadingState';
import { ScanPreview } from './components/ScanPreview';
import { ScanUploadState } from './components/ScanUploadState';
import { canRetryScan } from './utils/canRetryScan';
import { resolveScanView } from './utils/resolveScanView';
import type { ScanInvoiceModalProps } from './types';

export function ScanInvoiceModal({
  open,
  status,
  errorMessage,
  selectedFile,
  previewUrl,
  onClose,
  onFileSelected,
  onConfirmScan,
  onChooseDifferentFile,
}: ScanInvoiceModalProps) {
  const view = resolveScanView(status, selectedFile, previewUrl);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan invoice</DialogTitle>
        </DialogHeader>

        {view.kind === 'loading' && <ScanLoadingState />}

        {view.kind === 'preview' && (
          <ScanPreview
            file={view.file}
            previewUrl={view.previewUrl}
            onConfirm={onConfirmScan}
            onChooseDifferent={onChooseDifferentFile}
          />
        )}

        {view.kind === 'upload' && (
          <ScanUploadState
            showError={status === 'error'}
            errorMessage={errorMessage}
            canRetry={canRetryScan(status, selectedFile)}
            onClose={onClose}
            onFileSelected={onFileSelected}
            onConfirmScan={onConfirmScan}
            onChooseDifferentFile={onChooseDifferentFile}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

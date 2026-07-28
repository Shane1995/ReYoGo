import { Button } from '@reyogo/ui';
import { ScanDropZone } from '../ScanDropZone';
import { ScanErrorBanner } from './components/ScanErrorBanner';
import { RetryActions } from './components/RetryActions';
import type { ScanUploadStateProps } from './types';

export function ScanUploadState({
  showError,
  errorMessage,
  canRetry,
  onClose,
  onFileSelected,
  onConfirmScan,
  onChooseDifferentFile,
}: ScanUploadStateProps) {
  return (
    <div className="flex flex-col gap-3">
      {showError && errorMessage && <ScanErrorBanner message={errorMessage} />}
      {canRetry ? (
        <RetryActions onChooseDifferentFile={onChooseDifferentFile} onConfirmScan={onConfirmScan} />
      ) : (
        <>
          <ScanDropZone onFileSelected={onFileSelected} />
          <Button variant="ghost" onClick={onClose} className="self-end">
            Cancel
          </Button>
        </>
      )}
    </div>
  );
}

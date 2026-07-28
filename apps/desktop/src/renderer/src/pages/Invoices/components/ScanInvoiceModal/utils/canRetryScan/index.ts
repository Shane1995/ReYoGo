import type { ScanStatus } from '../../../../hooks/useInvoiceScan/types';

export function canRetryScan(status: ScanStatus, selectedFile: File | null): boolean {
  return status === 'error' && !!selectedFile;
}

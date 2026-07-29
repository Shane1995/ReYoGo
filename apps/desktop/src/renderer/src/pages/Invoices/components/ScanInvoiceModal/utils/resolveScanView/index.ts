import type { ScanStatus } from '../../../../hooks/useInvoiceScan/types';
import type { ScanView } from './types';

function previewReady(
  status: ScanStatus,
  selectedFile: File | null,
  previewUrl: string | null,
): { file: File; previewUrl: string } | null {
  if (status !== 'preview') return null;
  if (!selectedFile || !previewUrl) return null;
  return { file: selectedFile, previewUrl };
}

export function resolveScanView(
  status: ScanStatus,
  selectedFile: File | null,
  previewUrl: string | null,
): ScanView {
  if (status === 'scanning') return { kind: 'loading' };
  const preview = previewReady(status, selectedFile, previewUrl);
  if (preview) return { kind: 'preview', ...preview };
  return { kind: 'upload' };
}

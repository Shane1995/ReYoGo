import type { ScanConfidence } from '@reyogo/types';
import type { LastScanSummary } from '../../hooks/useInvoiceScan/types';

export type DisplayConfidence = ScanConfidence | 'needsReview';

export type ScanSummaryBarProps = {
  summary: LastScanSummary;
  onDismiss: () => void;
};

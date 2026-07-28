import type { LastScanSummary } from '../../hooks/useInvoiceScan/types';

export type ScanSummaryBarProps = {
  summary: LastScanSummary;
  onDismiss: () => void;
};

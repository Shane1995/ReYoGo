import type { TotalMismatch } from '../../../../utils/reconcileScannedTotal/types';

export type ScanReviewNotesListProps = {
  totalMismatch: TotalMismatch | null;
  reviewNotes: string[];
};

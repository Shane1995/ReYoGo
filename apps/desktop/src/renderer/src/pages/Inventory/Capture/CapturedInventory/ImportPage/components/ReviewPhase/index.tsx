import { ImportReview } from '@/components/CsvImport/ImportReview';
import type { ReviewPhaseProps } from './types';

export function ReviewPhase({ state, onCommit, onCancel }: ReviewPhaseProps) {
  if (state.phase !== 'review') return null;
  return (
    <ImportReview
      review={state.review}
      onCommit={onCommit}
      onCancel={onCancel}
      commitLabel="Commit to database"
    />
  );
}

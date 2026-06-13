import { ImportReview } from '@/components/CsvImport/ImportReview';
import type { ReviewResult } from '@/components/CsvImport/review';
import type { PageState } from '../../types';

export function ReviewPhase({
  state,
  onCommit,
  onCancel,
}: {
  state: PageState;
  onCommit: (review: ReviewResult) => void;
  onCancel: () => void;
}) {
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

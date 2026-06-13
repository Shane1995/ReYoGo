import type { ReviewResult } from '../review';

export interface ImportReviewProps {
  review: ReviewResult;
  onCommit: (review: ReviewResult) => void;
  onCancel: () => void;
  commitLabel?: string;
}

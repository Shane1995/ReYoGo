import type { ReviewResult } from '@/components/CsvImport/review';
import type { PageState } from '../../types';

export type ReviewPhaseProps = {
  state: PageState;
  onCommit: (review: ReviewResult) => void;
  onCancel: () => void;
};

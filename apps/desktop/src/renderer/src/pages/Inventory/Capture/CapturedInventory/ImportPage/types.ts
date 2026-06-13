import type { ReviewResult } from '@/components/CsvImport/review';

export const LOADING_LABEL = {
  ReadingFile: 'Reading file…',
  CheckingDatabase: 'Checking against database…',
  SavingToDatabase: 'Saving to database…',
} as const;

export type LoadingLabel = (typeof LOADING_LABEL)[keyof typeof LOADING_LABEL];

export type PageState =
  | { phase: 'idle' }
  | { phase: 'loading'; label: LoadingLabel }
  | { phase: 'review'; review: ReviewResult }
  | { phase: 'error'; message: string };

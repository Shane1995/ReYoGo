import type { ReviewResult } from '@/components/CsvImport/review';
import { LOADING_LABEL } from './constants';

export type LoadingLabel = (typeof LOADING_LABEL)[keyof typeof LOADING_LABEL];

export type PageState =
  | { phase: 'idle' }
  | { phase: 'loading'; label: LoadingLabel }
  | { phase: 'review'; review: ReviewResult }
  | { phase: 'error'; message: string };

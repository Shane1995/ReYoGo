import type { PageState } from '../../types';

export type ErrorPhaseProps = {
  state: PageState;
  onRetry: () => void;
};

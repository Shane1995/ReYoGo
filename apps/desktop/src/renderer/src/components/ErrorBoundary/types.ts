import type { ReactNode } from 'react';

export type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

export type State = {
  hasError: boolean;
  error: Error | null;
};

import type { ReactNode } from 'react';

export type CategoryGroupProps = {
  category: string;
  count: number;
  summary?: ReactNode;
  isExpanded: boolean;
  onToggle: (category: string) => void;
  children: ReactNode;
};

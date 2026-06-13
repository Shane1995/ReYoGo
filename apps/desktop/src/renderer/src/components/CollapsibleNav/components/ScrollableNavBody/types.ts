import type { ReactNode } from 'react';

export type ScrollableNavBodyProps = {
  items: ReactNode;
  bottomItems: ReactNode;
  collapsed: boolean;
  onToggle: () => void;
};

import type { ReactNode } from 'react';

export type FixedNavBodyProps = {
  items: ReactNode;
  bottomItems: ReactNode;
  collapsed: boolean;
  onToggle: () => void;
};

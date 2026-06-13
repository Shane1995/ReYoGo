import type { LucideIcon } from 'lucide-react';
import type { CSSProperties } from 'react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  end: boolean;
}

export interface CollapsibleNavProps {
  navItems: readonly NavItem[];
  storageKey: string;
  width?: { expanded: number; collapsed: number };
  iconClassName?: string;
  bottomNavItems?: readonly NavItem[];
  scrollable?: boolean;
  className?: string;
  style?: CSSProperties;
}

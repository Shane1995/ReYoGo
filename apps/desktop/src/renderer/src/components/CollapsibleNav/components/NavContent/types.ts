import type { NavItem } from '../../types';

export type NavContentProps = {
  navItems: readonly NavItem[];
  bottomNavItems?: readonly NavItem[];
  collapsed: boolean;
  iconClassName?: string;
  scrollable: boolean;
  onToggle: () => void;
};

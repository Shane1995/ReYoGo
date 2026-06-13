import type { NavItem } from '../../types';

export type NavItemListProps = {
  navItems: readonly NavItem[];
  collapsed: boolean;
  iconClassName?: string;
};

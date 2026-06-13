import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@reyogo/ui';
import { DEFAULT_WIDTH, SPRING } from './constants';
import { NavContent } from './components/NavContent';
import type { CollapsibleNavProps } from './types';

export type { NavItem } from './types';

export function CollapsibleNav({
  navItems,
  storageKey,
  width = DEFAULT_WIDTH,
  iconClassName,
  bottomNavItems,
  scrollable = false,
  className,
  style,
}: CollapsibleNavProps) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(storageKey) === 'true');

  const toggle = () =>
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(storageKey, String(next));
      return next;
    });

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? width.collapsed : width.expanded }}
      transition={SPRING}
      className={cn('relative flex shrink-0 flex-col overflow-hidden', className)}
      style={style}
    >
      <NavContent
        navItems={navItems}
        bottomNavItems={bottomNavItems}
        collapsed={collapsed}
        iconClassName={iconClassName}
        scrollable={scrollable}
        onToggle={toggle}
      />
    </motion.aside>
  );
}

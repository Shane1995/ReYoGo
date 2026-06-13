import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, navLinkClass } from '@reyogo/ui';
import { LABEL_ANIM } from '../../constants';
import type { NavItemListProps } from './types';

export function NavItemList({ navItems, collapsed, iconClassName }: NavItemListProps) {
  return (
    <>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          title={collapsed ? item.label : undefined}
          className={({ isActive }) =>
            cn(navLinkClass({ isActive }), collapsed && 'justify-center px-0')
          }
        >
          <item.icon className={cn('size-4 shrink-0', iconClassName)} aria-hidden />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span key="label" {...LABEL_ANIM} className="whitespace-nowrap">
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
      ))}
    </>
  );
}

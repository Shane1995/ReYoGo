import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, navLinkClass } from '@reyogo/ui';
import { ChevronRightIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  end: boolean;
}

interface CollapsibleNavProps {
  navItems: readonly NavItem[];
  storageKey: string;
  width?: { expanded: number; collapsed: number };
  iconClassName?: string;
  bottomNavItems?: readonly NavItem[];
  scrollable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_WIDTH = { expanded: 192, collapsed: 56 };

const spring = { type: 'spring', stiffness: 340, damping: 30 } as const;
const labelAnim = {
  initial: { opacity: 0, x: -6 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.14, ease: 'easeOut' } },
  exit: { opacity: 0, x: -4, transition: { duration: 0.1, ease: 'easeIn' } },
} as const;

function NavItemList({
  navItems,
  collapsed,
  iconClassName,
}: {
  navItems: readonly NavItem[];
  collapsed: boolean;
  iconClassName?: string;
}) {
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
              <motion.span key="label" {...labelAnim} className="whitespace-nowrap">
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
      ))}
    </>
  );
}

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

  const toggleButton = (
    <button
      onClick={toggle}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[rgba(255,255,255,0.05)] px-3 py-2 text-xs font-medium text-[rgba(255,255,255,0.4)] transition-colors hover:bg-[rgba(255,255,255,0.09)] hover:text-[rgba(255,255,255,0.75)]"
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      <motion.span animate={{ rotate: collapsed ? 0 : 180 }} transition={spring} className="flex">
        <ChevronRightIcon className="size-3.5" />
      </motion.span>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span key="label" {...labelAnim} className="whitespace-nowrap">
            Collapse
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? width.collapsed : width.expanded }}
      transition={spring}
      className={cn('relative flex shrink-0 flex-col overflow-hidden', className)}
      style={style}
    >
      {scrollable ? (
        <>
          <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
            <NavItemList navItems={navItems} collapsed={collapsed} iconClassName={iconClassName} />
          </nav>
          <div className="shrink-0 border-t border-[rgba(255,255,255,0.07)]">
            {bottomNavItems && bottomNavItems.length > 0 && (
              <div className="px-2 pt-2">
                <NavItemList
                  navItems={bottomNavItems}
                  collapsed={collapsed}
                  iconClassName={iconClassName}
                />
              </div>
            )}
            <div className="p-2">{toggleButton}</div>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col gap-0.5 p-3">
          <NavItemList navItems={navItems} collapsed={collapsed} iconClassName={iconClassName} />
          {bottomNavItems && bottomNavItems.length > 0 && (
            <NavItemList
              navItems={bottomNavItems}
              collapsed={collapsed}
              iconClassName={iconClassName}
            />
          )}
          <div className="mt-auto">{toggleButton}</div>
        </div>
      )}
    </motion.aside>
  );
}

import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, navLinkClass } from '@reyogo/ui';
import { ChevronRightIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SectionNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  end: boolean;
}

interface SectionLayoutProps {
  navItems: readonly SectionNavItem[];
  storageKey?: string;
  children?: React.ReactNode;
}

const EXPANDED_W = 192;
const COLLAPSED_W = 56;

const spring = { type: 'spring', stiffness: 340, damping: 30 } as const;
const labelAnim = {
  initial: { opacity: 0, x: -6 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.14, ease: 'easeOut' } },
  exit:    { opacity: 0, x: -4, transition: { duration: 0.1, ease: 'easeIn' } },
} as const;

export function SectionLayout({
  navItems,
  storageKey = 'sidebar-section-collapsed',
  children,
}: SectionLayoutProps) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(storageKey) === 'true',
  );

  const toggle = () =>
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(storageKey, String(next));
      return next;
    });

  return (
    <div className="flex min-h-0 flex-1 flex-row">
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
        transition={spring}
        className="relative flex shrink-0 flex-col gap-0.5 overflow-hidden border-r border-[rgba(255,255,255,0.06)] p-3"
        style={{
          background: 'rgba(20,28,40,0.80)',
          backdropFilter: 'blur(22px) saturate(180%)',
          boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.04), 4px 0 16px rgba(0,0,0,0.25)',
          '--nav-active-border': '#20C997',
          '--nav-accent': 'rgba(32,201,151,0.10)',
          '--nav-foreground': 'rgba(255,255,255,0.9)',
          '--nav-foreground-muted': 'rgba(255,255,255,0.45)',
        } as React.CSSProperties}
      >
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
            <item.icon className="size-4 shrink-0 opacity-70" aria-hidden />
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span key="label" {...labelAnim} className="whitespace-nowrap">
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}

        <button
          onClick={toggle}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-[rgba(255,255,255,0.06)] px-3 py-2 text-xs font-medium text-[rgba(255,255,255,0.5)] transition-colors hover:bg-[rgba(255,255,255,0.10)] hover:text-[rgba(255,255,255,0.85)]"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.span
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={spring}
            className="flex"
          >
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
      </motion.aside>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children ?? <Outlet />}
      </div>
    </div>
  );
}

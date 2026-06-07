import { Outlet } from 'react-router-dom';
import { CollapsibleNav } from '@/components/CollapsibleNav';
import type { NavItem } from '@/components/CollapsibleNav';

interface SectionLayoutProps {
  navItems: readonly NavItem[];
  storageKey?: string;
  children?: React.ReactNode;
}

export function SectionLayout({
  navItems,
  storageKey = 'sidebar-section-collapsed',
  children,
}: SectionLayoutProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-row">
      <CollapsibleNav
        navItems={navItems}
        storageKey={storageKey}
        iconClassName="opacity-70"
        className="border-r border-[rgba(255,255,255,0.06)]"
        style={
          {
            background: 'rgba(20,28,40,0.80)',
            backdropFilter: 'blur(22px) saturate(180%)',
            boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.04), 4px 0 16px rgba(0,0,0,0.25)',
            '--nav-active-border': '#20C997',
            '--nav-accent': 'rgba(32,201,151,0.10)',
            '--nav-foreground': 'rgba(255,255,255,0.9)',
            '--nav-foreground-muted': 'rgba(255,255,255,0.45)',
          } as React.CSSProperties
        }
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children ?? <Outlet />}</div>
    </div>
  );
}

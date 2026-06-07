import { Settings as SettingsIcon } from 'lucide-react';
import { useNavItems } from '@/config/nav';
import { SettingsRoutes } from '@/components/AppRoutes/routePaths';
import { CollapsibleNav } from '@/components/CollapsibleNav';
import type { NavItem } from '@/components/CollapsibleNav';

const EXPANDED_W = 224;
const COLLAPSED_W = 56;

const settingsItem: NavItem = {
  label: 'Settings',
  path: SettingsRoutes.Base,
  icon: SettingsIcon,
  end: true,
};

export function AppSidebar() {
  const { primary } = useNavItems();

  return (
    <CollapsibleNav
      navItems={primary}
      storageKey="sidebar-primary-collapsed"
      width={{ expanded: EXPANDED_W, collapsed: COLLAPSED_W }}
      bottomNavItems={[settingsItem]}
      scrollable
      className="h-full border-r border-[rgba(255,255,255,0.08)]"
      style={
        {
          background: 'rgba(13,17,23,0.92)',
          backdropFilter: 'blur(28px) saturate(200%)',
          boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.05), 4px 0 24px rgba(0,0,0,0.35)',
          '--nav-active-border': '#20C997',
          '--nav-accent': 'rgba(32,201,151,0.12)',
          '--nav-foreground': 'white',
          '--nav-foreground-muted': 'rgba(255,255,255,0.5)',
        } as React.CSSProperties
      }
    />
  );
}

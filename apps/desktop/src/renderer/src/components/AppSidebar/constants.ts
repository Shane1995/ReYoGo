import { Settings as SettingsIcon } from 'lucide-react';
import { SettingsRoutes } from '@/components/AppRoutes/routePaths';
import type { NavItem } from '@/components/CollapsibleNav';
import type { CSSPropertiesWithVars } from './types';

export const EXPANDED_WIDTH = 224;
export const COLLAPSED_WIDTH = 56;

export const SETTINGS_NAV_ITEM: NavItem = {
  label: 'Settings',
  path: SettingsRoutes.Base,
  icon: SettingsIcon,
  end: true,
};

export const SIDEBAR_STYLE: CSSPropertiesWithVars = {
  background: 'rgba(13,17,23,0.92)',
  backdropFilter: 'blur(28px) saturate(200%)',
  boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.05), 4px 0 24px rgba(0,0,0,0.35)',
  '--nav-active-border': '#20C997',
  '--nav-accent': 'rgba(32,201,151,0.12)',
  '--nav-foreground': 'white',
  '--nav-foreground-muted': 'rgba(255,255,255,0.5)',
};

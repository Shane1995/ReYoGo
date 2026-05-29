import { NavLink, Outlet } from 'react-router-dom';
import { BuildingIcon, PercentIcon } from 'lucide-react';
import { cn } from '@reyogo/ui';
import { SettingsRoutes } from '@/components/AppRoutes/routePaths';

const navItems = [
  { label: 'Business', path: SettingsRoutes.Business, icon: BuildingIcon },
  { label: 'Tax', path: SettingsRoutes.Tax, icon: PercentIcon },
] as const;

export function SettingsLayout() {
  return (
    <div className="flex min-h-full">
      <aside className="w-48 shrink-0 border-r border-border bg-card/40 px-3 py-6 flex flex-col gap-1">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Settings
        </p>
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            <Icon className="size-3.5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </aside>
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

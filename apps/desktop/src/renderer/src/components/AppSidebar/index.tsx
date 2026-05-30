import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, navLinkClass } from '@reyogo/ui';
import { ChevronRightIcon, Settings as SettingsIcon } from 'lucide-react';
import { useNavItems } from '@/config/nav';
import { SettingsRoutes } from '@/components/AppRoutes/routePaths';
import { useEntities } from '@/Context/EntityContext';
import { cloudSyncService } from '@/services/cloudSync';
import { SyncState } from '@shared/types/cloudSync';

const EXPANDED_W = 224;
const COLLAPSED_W = 56;

const spring = { type: 'spring', stiffness: 340, damping: 30 } as const;
const labelAnim = {
  initial: { opacity: 0, x: -6 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.14, ease: 'easeOut' } },
  exit: { opacity: 0, x: -4, transition: { duration: 0.1, ease: 'easeIn' } },
} as const;

export function AppSidebar() {
  const { primary } = useNavItems();
  const { group } = useEntities();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar-primary-collapsed') === 'true',
  );
  const [syncState, setSyncState] = useState<string | null>(null);

  useEffect(() => {
    const poll = async () => {
      const status = await cloudSyncService.getStatus();
      setSyncState(status.isActive ? status.state : null);
    };
    poll();
    const interval = setInterval(poll, 30_000);
    return () => clearInterval(interval);
  }, []);

  const toggle = () =>
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem('sidebar-primary-collapsed', String(next));
      return next;
    });

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
      transition={spring}
      className="flex h-full shrink-0 flex-col overflow-hidden border-r border-[rgba(255,255,255,0.08)]"
      style={
        {
          background: 'rgba(13,17,23,0.88)',
          backdropFilter: 'blur(28px) saturate(200%)',
          boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.05), 4px 0 24px rgba(0,0,0,0.35)',
          '--nav-active-border': '#20C997',
          '--nav-accent': 'rgba(32,201,151,0.12)',
          '--nav-foreground': 'white',
          '--nav-foreground-muted': 'rgba(255,255,255,0.5)',
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          'flex shrink-0 items-center border-b border-[rgba(255,255,255,0.07)] px-3 py-4',
          collapsed ? 'justify-center' : 'gap-2.5',
        )}
      >
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="ReYoGo" className="size-6 shrink-0" />
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="brand"
              {...labelAnim}
              className="flex flex-col gap-0.5 overflow-hidden"
            >
              <span className="whitespace-nowrap text-sm font-semibold leading-none text-white">
                ReYoGo
              </span>
              {group?.name && (
                <span className="whitespace-nowrap text-xs text-[rgba(255,255,255,0.3)]">
                  {group.name}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
        {primary.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(navLinkClass({ isActive }), collapsed && 'justify-center px-0')
            }
          >
            <item.icon className="size-4 shrink-0" aria-hidden />
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span key="label" {...labelAnim} className="whitespace-nowrap">
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 border-t border-[rgba(255,255,255,0.07)]">
        <div className="px-2 pt-2">
          <NavLink
            to={SettingsRoutes.Base}
            end
            title={collapsed ? 'Settings' : undefined}
            className={({ isActive }) =>
              cn(navLinkClass({ isActive }), collapsed && 'justify-center px-0')
            }
          >
            <div className="relative shrink-0">
              <SettingsIcon className="size-4" aria-hidden />
              {syncState === SyncState.Idle && (
                <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-green-500" />
              )}
              {syncState === SyncState.Error && (
                <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-amber-500" />
              )}
            </div>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span key="settings-label" {...labelAnim} className="whitespace-nowrap">
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        </div>
        <div className="p-2">
          <button
            onClick={toggle}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[rgba(255,255,255,0.05)] px-3 py-2 text-xs font-medium text-[rgba(255,255,255,0.4)] transition-colors hover:bg-[rgba(255,255,255,0.09)] hover:text-[rgba(255,255,255,0.75)]"
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
        </div>
      </div>
    </motion.div>
  );
}

import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AnalysisRoutes } from "@/components/AppRoutes/routePaths";
import { TrendingUpIcon } from "lucide-react";

const sidebarItems = [
  { label: "Cost per unit", path: AnalysisRoutes.CostPerUnit, icon: TrendingUpIcon, end: false },
] as const;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
    "hover:bg-[var(--nav-accent)] hover:text-[var(--nav-foreground)]",
    "border-l-2 border-l-transparent",
    isActive && "border-l-[var(--nav-active-border)] bg-[var(--nav-accent)] text-[var(--nav-foreground)]"
  );

export function AnalysisSectionLayout() {
  return (
    <div className="flex min-h-0 flex-1 flex-row">
      <aside className="flex w-48 shrink-0 flex-col gap-0.5 border-r border-[var(--nav-border)] bg-[var(--nav-bg)] p-3">
        {sidebarItems.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.end} className={navLinkClass}>
            <item.icon className="size-4 shrink-0 opacity-60" aria-hidden />
            {item.label}
          </NavLink>
        ))}
      </aside>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

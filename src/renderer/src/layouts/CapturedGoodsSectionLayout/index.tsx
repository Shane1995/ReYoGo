import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { GoodsReceivedCaptureRoutes } from "@/components/AppRoutes/routePaths";
import { PackagePlusIcon, UploadIcon, ListPlusIcon, FolderPlusIcon, TagsIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const sidebarItems = [
  { label: "Captured Goods", path: GoodsReceivedCaptureRoutes.CapturedGoodsReceived, icon: PackagePlusIcon, end: true  },
  { label: "Add Items",      path: GoodsReceivedCaptureRoutes.Items,                  icon: ListPlusIcon,   end: true  },
  { label: "Add Categories", path: GoodsReceivedCaptureRoutes.Categories,             icon: FolderPlusIcon, end: true  },
  { label: "Good Types",     path: GoodsReceivedCaptureRoutes.GoodTypes,              icon: TagsIcon,       end: true  },
  { label: "Import",         path: GoodsReceivedCaptureRoutes.Import,                 icon: UploadIcon,     end: false },
] as const;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
    "border-l-2 border-l-transparent",
    isActive
      ? "border-l-[var(--nav-active-border)] bg-[var(--nav-accent)] text-[var(--nav-foreground)]"
      : "text-[var(--nav-foreground-muted)] hover:bg-[var(--nav-accent)] hover:text-[var(--nav-foreground)]"
  );

export function CapturedGoodsSectionLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebar-capture-collapsed") === "true");

  const toggleCollapsed = () =>
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("sidebar-capture-collapsed", String(next));
      return next;
    });

  return (
    <div className="flex min-h-0 flex-1 flex-row">
      <aside
        className={cn(
          "relative flex shrink-0 flex-col gap-0.5 border-r border-[var(--nav-border)] bg-[var(--nav-bg)] p-3 transition-all duration-200",
          collapsed ? "w-14" : "w-48"
        )}
      >
        {sidebarItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                navLinkClass({ isActive }),
                collapsed && "justify-center px-0"
              )
            }
          >
            <item.icon className="size-4 shrink-0 opacity-60" aria-hidden />
            {!collapsed && item.label}
          </NavLink>
        ))}
        <button
          onClick={toggleCollapsed}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--nav-foreground)] px-3 py-2 text-xs font-medium text-[var(--nav-bg)] opacity-70 hover:opacity-100 transition-opacity"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRightIcon className="size-3.5" /> : <><ChevronLeftIcon className="size-3.5" /><span>Collapse</span></>}
        </button>
      </aside>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

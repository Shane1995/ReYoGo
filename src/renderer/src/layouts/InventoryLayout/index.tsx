import { cn } from "@/lib/utils";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboardIcon, PackagePlusIcon, ReceiptIcon, TrendingUpIcon, CoinsIcon } from "lucide-react";
import { ProductRoutes, InventoryCaptureRoutes, InvoiceRoutes, AnalysisRoutes, CostingRoutes } from "@/components/AppRoutes/routePaths";

const subNavItems = [
  { label: "Overview",           path: ProductRoutes.Inventory,                        icon: LayoutDashboardIcon, end: true  },
  { label: "Analysis",           path: AnalysisRoutes.CostPerUnit,                     icon: TrendingUpIcon,      end: false },
  { label: "Costing",            path: CostingRoutes.Base,                             icon: CoinsIcon,           end: false },
  { label: "Captured Inventory", path: InventoryCaptureRoutes.CapturedInventory,       icon: PackagePlusIcon,     end: false },
  { label: "Invoice",            path: InvoiceRoutes.Base,                             icon: ReceiptIcon,         end: false },
] as const;

const tabClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
    isActive
      ? "border-[var(--nav-active-border)] text-[var(--nav-foreground)]"
      : "border-transparent text-[var(--nav-foreground-muted)] hover:border-[var(--nav-border)] hover:text-[var(--nav-foreground)]"
  );

const InventoryLayout = () => (
  <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
    <nav className="flex shrink-0 items-end gap-0 overflow-x-auto bg-[var(--nav-bg)] px-4 border-b border-[var(--nav-border)]">
      {subNavItems.map((item) => (
        <NavLink key={item.path} to={item.path} end={item.end} className={tabClass}>
          <item.icon className="size-3.5 shrink-0" aria-hidden />
          {item.label}
        </NavLink>
      ))}
    </nav>
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--content-tint)]">
      <Outlet />
    </main>
  </div>
);

export default InventoryLayout;

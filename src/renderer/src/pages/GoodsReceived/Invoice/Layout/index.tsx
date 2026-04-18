import { NavLink, Outlet } from "react-router-dom";
import { InventoryProvider } from "@/pages/GoodsReceived/Capture/CapturedGoodsReceived/Context/InventoryContext";
import { InvoiceRoutes } from "@/components/AppRoutes/routePaths";
import { cn } from "@/lib/utils";
import { HistoryIcon, ReceiptIcon } from "lucide-react";

const invoiceTabs = [
  { label: "Capture Invoice", path: InvoiceRoutes.Base,    icon: ReceiptIcon, end: true  },
  { label: "History",         path: InvoiceRoutes.History, icon: HistoryIcon, end: false },
] as const;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
    "hover:bg-[var(--nav-accent)] hover:text-[var(--nav-foreground)]",
    "border-l-2 border-l-transparent",
    isActive && "border-l-[var(--nav-active-border)] bg-[var(--nav-accent)] text-[var(--nav-foreground)]"
  );

export function InvoiceLayout() {
  return (
    <InventoryProvider>
      <div className="flex min-h-0 flex-1 flex-row">
        {/* Side menu */}
        <aside className="flex w-48 shrink-0 flex-col gap-0.5 border-r border-[var(--nav-border)] bg-[var(--nav-bg)] p-3">
          {invoiceTabs.map((tab) => (
            <NavLink key={tab.path} to={tab.path} end={tab.end} className={navLinkClass}>
              <tab.icon className="size-4 shrink-0 opacity-60" aria-hidden />
              {tab.label}
            </NavLink>
          ))}
        </aside>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </div>
      </div>
    </InventoryProvider>
  );
}

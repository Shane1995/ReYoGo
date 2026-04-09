import { cn } from "@/lib/utils";
import { NavLink, Outlet } from "react-router-dom";
import {
  FolderPlusIcon,
  History,
  LayoutDashboardIcon,
  InfoIcon,
  PackagePlusIcon,
  PlusCircleIcon,
  ReceiptIcon,
  TrendingUpIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarNav,
  SidebarNavItem,
} from "@/components/ui/sidebar";
import { ProductRoutes, GoodsReceivedCaptureRoutes, InvoiceRoutes, AnalysisRoutes } from "@/components/AppRoutes/routePaths";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
    "hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
    "border-l-2 border-l-transparent",
    isActive && "border-l-[var(--sidebar-primary)] bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
  );

const iconClass = "size-4 shrink-0 text-[var(--sidebar-foreground)]/60";

const GoodsReceivedLayout = () => (
  <div className="flex min-h-0 flex-1 flex-row">
    <Sidebar className="shrink-0">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Goods Received</SidebarGroupLabel>
          <SidebarNav>
            <SidebarNavItem>
              <NavLink to={ProductRoutes.GoodsReceived} end className={navLinkClass}>
                <LayoutDashboardIcon className={iconClass} aria-hidden />
                Overview
              </NavLink>
            </SidebarNavItem>
            <SidebarNavItem>
              <NavLink to={`${ProductRoutes.GoodsReceived}/about`} className={navLinkClass}>
                <InfoIcon className={iconClass} aria-hidden />
                About
              </NavLink>
            </SidebarNavItem>
            <SidebarNavItem>
              <NavLink to={`${ProductRoutes.GoodsReceived}/history`} className={navLinkClass}>
                <History className={iconClass} aria-hidden />
                History
              </NavLink>
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Capture</SidebarGroupLabel>
          <SidebarNav>
            <SidebarNavItem>
              <NavLink to={GoodsReceivedCaptureRoutes.CapturedGoodsReceived} end className={navLinkClass}>
                <PackagePlusIcon className={iconClass} aria-hidden />
                Captured Goods Received
              </NavLink>
            </SidebarNavItem>
            <SidebarNavItem>
              <NavLink to={GoodsReceivedCaptureRoutes.AddItems} className={navLinkClass}>
                <PlusCircleIcon className={iconClass} aria-hidden />
                Add items
              </NavLink>
            </SidebarNavItem>
            <SidebarNavItem>
              <NavLink to={GoodsReceivedCaptureRoutes.AddCategories} className={navLinkClass}>
                <FolderPlusIcon className={iconClass} aria-hidden />
                Add categories
              </NavLink>
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Process</SidebarGroupLabel>
          <SidebarNav>
            <SidebarNavItem>
              <NavLink to={InvoiceRoutes.Base} end className={navLinkClass}>
                <ReceiptIcon className={iconClass} aria-hidden />
                Capture Invoice
              </NavLink>
            </SidebarNavItem>
            <SidebarNavItem>
              <NavLink to={InvoiceRoutes.History} className={navLinkClass}>
                <History className={iconClass} aria-hidden />
                Invoice history
              </NavLink>
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Analysis</SidebarGroupLabel>
          <SidebarNav>
            <SidebarNavItem>
              <NavLink to={AnalysisRoutes.CostPerUnit} className={navLinkClass}>
                <TrendingUpIcon className={iconClass} aria-hidden />
                Cost per unit
              </NavLink>
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    <main className="flex flex-1 min-h-0 flex-col overflow-hidden bg-[var(--content-tint)]">
      <Outlet />
    </main>
  </div>
);
export default GoodsReceivedLayout;

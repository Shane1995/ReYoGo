import * as React from "react";
import { cn } from "@/lib/utils";

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="sidebar"
    className={cn(
      "flex h-full min-h-0 w-[--sidebar-width] flex-col bg-[var(--sidebar)] text-[var(--sidebar-foreground)]",
      "border-r border-[var(--sidebar-border)] shadow-[2px_0_8px_-2px_rgba(0,0,0,0.05)]",
      className
    )}
    style={{ "--sidebar-width": "14rem" } as React.CSSProperties}
    {...props}
  />
));
Sidebar.displayName = "Sidebar";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="content"
    className={cn("flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto py-4 px-3", className)}
    {...props}
  />
));
SidebarContent.displayName = "SidebarContent";

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group"
    className={cn("flex flex-col gap-0.5", className)}
    {...props}
  />
));
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-label"
    className={cn(
      "px-3 py-2 text-[11px] font-medium uppercase tracking-widest text-[var(--sidebar-foreground)]/50",
      className
    )}
    {...props}
  />
));
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarNav = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="nav"
    className={cn("flex flex-col gap-0.5", className)}
    {...props}
  />
));
SidebarNav.displayName = "SidebarNav";

const SidebarNavItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} data-sidebar="nav-item" className={cn("list-none", className)} {...props} />
));
SidebarNavItem.displayName = "SidebarNavItem";

export interface SidebarNavLinkProps
  extends React.ComponentPropsWithoutRef<"a"> {
  active?: boolean;
}

const SidebarNavLink = React.forwardRef<
  HTMLAnchorElement,
  SidebarNavLinkProps
>(({ className, active, ...props }, ref) => (
  <a
    ref={ref}
    data-sidebar="nav-link"
    className={cn(
      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
      "hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
      "border-l-2 border-l-transparent",
      active && "border-l-[var(--sidebar-primary)] bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]",
      className
    )}
    data-active={active}
    {...props}
  />
));
SidebarNavLink.displayName = "SidebarNavLink";

export {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarNav,
  SidebarNavItem,
  SidebarNavLink,
};

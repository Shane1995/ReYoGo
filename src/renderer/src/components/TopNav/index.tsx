import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ProductRoutes } from "@/components/AppRoutes/routePaths";

const navItems = [
  { label: "Inventory", path: ProductRoutes.InventoryValidation },
] as const;

export const TopNav = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--nav-bg)]">
      <div className="flex items-end gap-6 px-4">
        {/* Branding */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 py-3 font-semibold text-[var(--nav-foreground)] transition-opacity hover:opacity-80"
        >
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Logo" className="h-6 w-auto" />
          <span className="text-sm">ReYoGo</span>
        </Link>

        {/* Top-level nav tabs */}
        <nav className="flex items-end gap-0">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={false}
              className={({ isActive }) =>
                cn(
                  "-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "border-[var(--nav-active-border)] text-[var(--nav-foreground)]"
                    : "border-transparent text-[var(--nav-foreground-muted)] hover:border-[var(--nav-border)] hover:text-[var(--nav-foreground)]"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

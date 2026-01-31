import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ProductRoutes } from "@/components/AppRoutes/routePaths";

const navItems = [
  { label: "Goods Received", path: ProductRoutes.GoodsReceivedValidation },
] as const;

type TopNavProps = {
  /** When true, omit bottom border so header + sub-nav read as one block */
  hideBottomBorder?: boolean;
};

export const TopNav = ({ hideBottomBorder }: TopNavProps) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-[var(--nav-bg)] shadow-sm",
        "backdrop-blur supports-[backdrop-filter]:bg-[var(--nav-bg)]/90",
        !hideBottomBorder && "border-b border-[var(--nav-border)]"
      )}
    >
      <div className="container flex h-14 items-center gap-8 px-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-medium text-[var(--nav-foreground)] hover:opacity-90"
        >
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Logo" className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={false}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                  "hover:text-[var(--nav-foreground)]",
                  isActive
                    ? "border-[var(--nav-active-border)] text-[var(--nav-foreground)]"
                    : "border-transparent text-[var(--nav-foreground-muted)] hover:text-[var(--nav-foreground)]"
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

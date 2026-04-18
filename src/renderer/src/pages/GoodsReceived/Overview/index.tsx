import { Link } from "react-router-dom";
import { AnalysisRoutes, GoodsReceivedCaptureRoutes, InvoiceRoutes } from "@/components/AppRoutes/routePaths";
import { Button } from "@/components/ui/button";
import { PackagePlusIcon, ReceiptIcon, TrendingUpIcon } from "lucide-react";

const quickLinkGroups = [
  {
    title: "Capture",
    icon: PackagePlusIcon,
    links: [
      { label: "Captured Goods Received", to: GoodsReceivedCaptureRoutes.CapturedGoodsReceived },
      { label: "Add items", to: GoodsReceivedCaptureRoutes.Items },
      { label: "Add categories", to: GoodsReceivedCaptureRoutes.Categories },
    ],
  },
  {
    title: "Process",
    icon: ReceiptIcon,
    links: [
      { label: "Capture Invoice", to: InvoiceRoutes.Base },
      { label: "Invoice history", to: InvoiceRoutes.History },
    ],
  },
  {
    title: "Analysis",
    icon: TrendingUpIcon,
    links: [
      { label: "Cost per unit", to: AnalysisRoutes.CostPerUnit },
    ],
  },
] as const;

export default function GoodsReceivedOverview() {
  return (
    <div className="container mx-auto py-6 px-4 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Goods Received</h1>
        <p className="mt-2 text-muted-foreground">
          Capture goods received information and save it to the database.
        </p>
      </div>
      <div>
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">Quick links</h2>
        <div className="flex flex-wrap gap-6">
          {quickLinkGroups.map(({ title, icon: Icon, links }) => (
            <div
              key={title}
              className="rounded-xl border border-[var(--nav-border)] bg-[var(--nav-bg)]/50 p-4 shadow-sm"
            >
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--nav-foreground-muted)]">
                <Icon className="size-3.5" aria-hidden />
                {title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {links.map(({ label, to }) => (
                  <Button
                    key={to}
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-[var(--nav-border)] text-[var(--nav-foreground)] hover:bg-[var(--nav-accent)] hover:text-[var(--nav-accent-foreground)]"
                  >
                    <Link to={to} className="inline-flex items-center gap-2">
                      {label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

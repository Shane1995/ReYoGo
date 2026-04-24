export default function CostingDashboard() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-[var(--nav-border)] bg-background px-4 py-3">
        <h1 className="text-lg font-semibold text-foreground">Costing Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          COGS summary and budget vs actual — coming soon.
        </p>
      </header>
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Dashboard widgets will appear here.
      </div>
    </div>
  );
}

export enum ProductRoutes {
  Inventory = "/inventory",
}

export enum StockRoutes {
  Base       = "/inventory/stock",
  Import     = "/inventory/stock/import",
  AddItems   = "/inventory/stock/add-items",
  Categories = "/inventory/stock/categories",
  Types      = "/inventory/stock/types",
}

export enum InvoiceRoutes {
  Base    = "/inventory/invoices",
  History = "/inventory/invoices/history",
}

export enum AnalysisRoutes {
  CostPerUnit = "/inventory/analysis",
  ItemTrend   = "/inventory/analysis/item/:itemId",
}

export enum CostingRoutes {
  Base          = "/inventory/costing",
  Dashboard     = "/inventory/costing",
  PriceVariance = "/inventory/costing/price-variance",
  CostReport    = "/inventory/costing/cost-report",
}

export function itemTrendPath(itemId: string) {
  return `/inventory/analysis/item/${itemId}`;
}

export enum UserRoutes {
  Home = "/",
}

export enum InventoryRouteSegments {
  root                 = "inventory",
  stock                = "stock",
  import               = "import",
  addItems             = "add-items",
  categories           = "categories",
  types                = "types",
  invoices             = "invoices",
  invoiceHistory       = "history",
  analysis             = "analysis",
  costing              = "costing",
  costingPriceVariance = "price-variance",
  costingCostReport    = "cost-report",
}

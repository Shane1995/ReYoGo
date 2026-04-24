export enum ProductRoutes {
  InventoryValidation = "/inventory",
  Inventory = "/inventory",
}

export enum InventoryCaptureRoutes {
  CapturedInventory = "/inventory/capture/captured-inventory",
  Import = "/inventory/capture/captured-inventory/import",
  Items = "/inventory/capture/items",
  Categories = "/inventory/capture/categories",
  GoodTypes = "/inventory/capture/good-types",
}

export enum InvoiceRoutes {
  Base = "/inventory/invoice",
  History = "/inventory/invoice/history",
}

export enum AnalysisRoutes {
  CostPerUnit = "/inventory/analysis",
  ItemTrend = "/inventory/analysis/item/:itemId",
}

export enum CostingRoutes {
  Base = "/inventory/costing",
  Dashboard = "/inventory/costing/dashboard",
  PriceVariance = "/inventory/costing/price-variance",
  CostReport = "/inventory/costing/cost-report",
}

export function itemTrendPath(itemId: string) {
  return `/inventory/analysis/item/${itemId}`;
}

export enum UserRoutes {
  Home = "/",
}

export enum InventoryRouteSegments {
  root = "inventory",
  capture = "capture",
  capturedInventory = "captured-inventory",
  import = "import",
  items = "items",
  categories = "categories",
  goodTypes = "good-types",
  invoice = "invoice",
  invoiceHistory = "history",
  analysis = "analysis",
  costing = "costing",
  costingDashboard = "dashboard",
  costingPriceVariance = "price-variance",
  costingCostReport = "cost-report",
  view = "view",
  add = "add",
}

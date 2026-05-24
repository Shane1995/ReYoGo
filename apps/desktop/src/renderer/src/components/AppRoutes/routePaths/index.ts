export enum UserRoutes {
  Home = '/',
}

export enum StockRoutes {
  Base = '/stock',
  Import = '/stock/import',
  AddItems = '/stock/add-items',
  Categories = '/stock/categories',
  Types = '/stock/types',
  Analysis = '/stock/analysis',
}

export function itemTrendPath(itemId: string) {
  return `/stock/analysis/item/${itemId}`;
}

export enum InvoiceRoutes {
  Base = '/invoices',
  History = '/invoices/history',
}

export enum CostingRoutes {
  Base = '/costing',
  PriceVariance = '/costing/price-variance',
  CostReport = '/costing/cost-report',
}

export enum SuppliersRoutes {
  Base = '/suppliers',
}

// Backward-compat aliases — kept so existing pages compile without changes
export const AnalysisRoutes = {
  CostPerUnit: StockRoutes.Analysis,
  ItemTrend: '/stock/analysis/item/:itemId',
} as const;

export const ProductRoutes = {
  Inventory: UserRoutes.Home,
} as const;

// Route segments — used as <Route path="..."> values
export enum StockRouteSegments {
  root = 'stock',
  import = 'import',
  addItems = 'add-items',
  categories = 'categories',
  types = 'types',
  analysis = 'analysis',
}

export enum InvoiceRouteSegments {
  root = 'invoices',
  history = 'history',
}

export enum CostingRouteSegments {
  root = 'costing',
  priceVariance = 'price-variance',
  costReport = 'cost-report',
}

export enum SuppliersRouteSegments {
  root = 'suppliers',
}

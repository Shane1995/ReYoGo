import { appConfig } from '@/config/app.config';

const r = appConfig.routes;
const lastSeg = (path: string) => path.split('/').at(-1)!;

export const UserRoutes = {
  Home: r.home,
} as const;

export const StockRoutes = {
  Base: r.stock,
  Import: r['stock.import'],
  AddItems: r['stock.addItems'],
  Categories: r['stock.categories'],
  Analysis: r['stock.analysis'],
  Manage: r['stock.manage'],
} as const;

export function itemTrendPath(itemId: string) {
  return `${r['stock.analysis']}/item/${itemId}`;
}

export const InvoiceRoutes = {
  Base: r.invoices,
  History: r['invoices.history'],
} as const;

export const CostingRoutes = {
  Base: r.costing,
  PriceVariance: r['costing.priceVariance'],
  CostReport: r['costing.costReport'],
} as const;

export const SuppliersRoutes = {
  Base: r.suppliers,
} as const;

export const AnalysisRoutes = {
  CostPerUnit: r['stock.analysis'],
  ItemTrend: `${r['stock.analysis']}/item/:itemId`,
} as const;

export const ProductRoutes = {
  Inventory: r.home,
} as const;

export const StockRouteSegments = {
  root: lastSeg(r.stock),
  import: lastSeg(r['stock.import']),
  addItems: lastSeg(r['stock.addItems']),
  categories: lastSeg(r['stock.categories']),
  analysis: lastSeg(r['stock.analysis']),
  manage: lastSeg(r['stock.manage']),
} as const;

export const InvoiceRouteSegments = {
  root: lastSeg(r.invoices),
  history: lastSeg(r['invoices.history']),
} as const;

export const CostingRouteSegments = {
  root: lastSeg(r.costing),
  priceVariance: lastSeg(r['costing.priceVariance']),
  costReport: lastSeg(r['costing.costReport']),
} as const;

export const SuppliersRouteSegments = {
  root: lastSeg(r.suppliers),
} as const;

export const SettingsRoutes = {
  Base: r.settings,
} as const;

export const SettingsRouteSegments = {
  root: lastSeg(r.settings),
} as const;

import { describe, it, expect } from 'vitest';
import {
  UserRoutes,
  StockRoutes,
  InvoiceRoutes,
  CostingRoutes,
  SuppliersRoutes,
  StockRouteSegments,
  InvoiceRouteSegments,
  CostingRouteSegments,
  SuppliersRouteSegments,
  AnalysisRoutes,
  ProductRoutes,
  itemTrendPath,
} from '.';

describe('itemTrendPath', () => {
  it('builds a path with the given item id', () => {
    expect(itemTrendPath('abc-123')).toBe('/stock/analysis/item/abc-123');
  });

  it('includes the base stock analysis segment', () => {
    expect(itemTrendPath('x')).toContain('/stock/analysis/item/');
  });
});

describe('UserRoutes', () => {
  it('Home is the root path', () => {
    expect(UserRoutes.Home).toBe('/');
  });
});

describe('StockRoutes', () => {
  it('Base is /stock', () => {
    expect(StockRoutes.Base).toBe('/stock');
  });

  it('all paths are prefixed with /stock', () => {
    const paths = Object.values(StockRoutes).filter((v) => v !== StockRoutes.Base);
    paths.forEach((p) => expect(p).toMatch(/^\/stock\//));
  });
});

describe('InvoiceRoutes', () => {
  it('Base is /invoices', () => {
    expect(InvoiceRoutes.Base).toBe('/invoices');
  });

  it('History is nested under /invoices', () => {
    expect(InvoiceRoutes.History).toBe('/invoices/history');
  });
});

describe('CostingRoutes', () => {
  it('Base is /costing', () => {
    expect(CostingRoutes.Base).toBe('/costing');
  });
});

describe('SuppliersRoutes', () => {
  it('Base is /suppliers', () => {
    expect(SuppliersRoutes.Base).toBe('/suppliers');
  });
});

describe('StockRouteSegments', () => {
  it('root is stock', () => {
    expect(StockRouteSegments.root).toBe('stock');
  });
});

describe('InvoiceRouteSegments', () => {
  it('root is invoices', () => {
    expect(InvoiceRouteSegments.root).toBe('invoices');
  });
});

describe('CostingRouteSegments', () => {
  it('root is costing', () => {
    expect(CostingRouteSegments.root).toBe('costing');
  });
});

describe('SuppliersRouteSegments', () => {
  it('root is suppliers', () => {
    expect(SuppliersRouteSegments.root).toBe('suppliers');
  });
});

describe('AnalysisRoutes backward-compat alias', () => {
  it('CostPerUnit points to StockRoutes.Analysis', () => {
    expect(AnalysisRoutes.CostPerUnit).toBe(StockRoutes.Analysis);
  });
});

describe('ProductRoutes backward-compat alias', () => {
  it('Inventory points to UserRoutes.Home', () => {
    expect(ProductRoutes.Inventory).toBe(UserRoutes.Home);
  });
});

import { describe, it, expect } from 'vitest';
import { appConfig } from './app.config';
import { iconRegistry, pathRegistry } from './resolvers';

describe('appConfig.nav', () => {
  const allNavItems = [
    ...appConfig.nav.primary,
    ...appConfig.nav.stock,
    ...appConfig.nav.invoices,
    ...appConfig.nav.costing,
  ];

  it('every nav item icon key exists in the icon registry', () => {
    allNavItems.forEach((item) => {
      expect(iconRegistry).toHaveProperty(item.icon);
    });
  });

  it('every nav item path key exists in the path registry', () => {
    allNavItems.forEach((item) => {
      expect(pathRegistry).toHaveProperty(item.pathKey);
    });
  });

  it('primary nav has five items', () => {
    expect(appConfig.nav.primary).toHaveLength(5);
  });

  it('stock nav has six items', () => {
    expect(appConfig.nav.stock).toHaveLength(6);
  });
});

describe('appConfig.dashboard.statCards', () => {
  it('has four stat cards', () => {
    expect(appConfig.dashboard.statCards).toHaveLength(4);
  });

  it('every stat card icon key exists in the icon registry', () => {
    appConfig.dashboard.statCards.forEach((card) => {
      expect(iconRegistry).toHaveProperty(card.icon);
    });
  });

  it('dynamic cards have a valid dataKey', () => {
    const validKeys = ['totalStockValue', 'monthlySpend'];
    appConfig.dashboard.statCards
      .filter((card) => 'dataKey' in card)
      .forEach((card) => {
        expect(validKeys).toContain((card as { dataKey: string }).dataKey);
      });
  });
});

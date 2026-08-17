import { describe, it, expect } from 'vitest';
import { appConfig } from './app.config';
import { resolveIcon } from './resolvers';

describe('appConfig.nav', () => {
  const allNavItems = [
    ...appConfig.nav.primary,
    ...appConfig.nav.stock,
    ...appConfig.nav.invoices,
    ...appConfig.nav.costing,
  ];

  it('every nav item icon key resolves without throwing', () => {
    allNavItems.forEach((item) => {
      expect(() => resolveIcon(item.icon)).not.toThrow();
    });
  });

  it('every nav item path key exists in the route config', () => {
    allNavItems.forEach((item) => {
      expect(appConfig.routes).toHaveProperty(item.pathKey);
    });
  });

  it('primary nav has four items', () => {
    expect(appConfig.nav.primary).toHaveLength(4);
  });

  it('stock nav has five items', () => {
    expect(appConfig.nav.stock).toHaveLength(5);
  });
});

describe('appConfig.dashboard.statCards', () => {
  it('has four stat cards', () => {
    expect(appConfig.dashboard.statCards).toHaveLength(4);
  });

  it('every stat card icon key resolves without throwing', () => {
    appConfig.dashboard.statCards.forEach((card) => {
      expect(() => resolveIcon(card.icon)).not.toThrow();
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
